using System.Security.Claims;
using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api/events/{slug}/reservations")]
public class ReservationsController(
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> Reserve(string slug, CreateReservationDto dto)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        ApplicationUser? user = null;

        if (User.Identity?.IsAuthenticated == true)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            user = await userManager.FindByIdAsync(userId!);
        }
        else if (!string.IsNullOrWhiteSpace(dto.GuestToken))
        {
            user = await db.Users.FirstOrDefaultAsync(u => u.GuestToken == dto.GuestToken);
        }

        if (user == null) return Unauthorized("Register as a guest first.");

        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.EventId == @event.Id);
        if (product == null) return NotFound("Product not found.");

        var existing = await db.Reservations
            .FirstOrDefaultAsync(r => r.UserId == user.Id && r.ProductId == dto.ProductId);

        var othersReserved = await db.Reservations
            .Where(r => r.ProductId == dto.ProductId && r.UserId != user.Id)
            .SumAsync(r => r.Quantity);

        var available = product.StockQuantity - othersReserved;

        if (existing != null)
        {
            var clamped = Math.Min(dto.Quantity, available);
            existing.Quantity = clamped;
            if (existing.Quantity <= 0) db.Reservations.Remove(existing);
        }
        else
        {
            if (dto.Quantity <= 0) return BadRequest("Quantity must be at least 1.");
            if (available <= 0) return BadRequest("This item is fully reserved.");
            db.Reservations.Add(new Reservation
            {
                UserId = user.Id,
                ProductId = dto.ProductId,
                Quantity = Math.Min(dto.Quantity, available),
                EventId = @event.Id
            });
        }

        await db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetMyReservations(
        string slug,
        [FromQuery] string? guestToken)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        ApplicationUser? user = null;

        if (User.Identity?.IsAuthenticated == true)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            user = await userManager.FindByIdAsync(userId!);
        }
        else if (!string.IsNullOrWhiteSpace(guestToken))
        {
            user = await db.Users.FirstOrDefaultAsync(u => u.GuestToken == guestToken);
        }

        if (user == null) return Unauthorized();

        var reservations = await db.Reservations
            .Include(r => r.Product)
            .Where(r => r.UserId == user.Id && r.EventId == @event.Id)
            .Select(r => new ReservationDto(
                r.Id, user.FirstName, user.LastName,
                r.ProductId, r.Product.Name, r.Product.Brand, r.Product.Price,
                r.Product.ImageURL, r.Quantity, r.Timestamp))
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Unreserve(string slug, int id, [FromQuery] string? guestToken)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        var reservation = await db.Reservations
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id && r.EventId == @event.Id);

        if (reservation == null) return NotFound("Reservation not found.");

        // Host or admin can delete any reservation for their event
        if (User.Identity?.IsAuthenticated == true)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isHostOrAdmin = User.IsInRole("Host") || User.IsInRole("Admin");

            if (isHostOrAdmin)
            {
                if (User.IsInRole("Host") && @event.HostId != userId) return Forbid();
            }
            else if (reservation.UserId != userId)
            {
                return Forbid();
            }
        }
        else if (!string.IsNullOrWhiteSpace(guestToken))
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.GuestToken == guestToken);
            if (user == null || reservation.UserId != user.Id) return Forbid();
        }
        else
        {
            return Unauthorized();
        }

        db.Reservations.Remove(reservation);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservationDto>>> GetAll(string slug)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        if (!User.IsInRole("Admin"))
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (@event.HostId != userId) return Forbid();
        }

        var reservations = await db.Reservations
            .Include(r => r.User)
            .Include(r => r.Product)
            .Where(r => r.EventId == @event.Id)
            .Select(r => new ReservationDto(
                r.Id, r.User.FirstName, r.User.LastName,
                r.ProductId, r.Product.Name, r.Product.Brand, r.Product.Price,
                r.Product.ImageURL, r.Quantity, r.Timestamp))
            .ToListAsync();
        return Ok(reservations);
    }
}
