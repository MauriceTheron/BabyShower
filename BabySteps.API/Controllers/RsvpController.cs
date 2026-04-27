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
[Route("api/events/{slug}/rsvp")]
public class RsvpController(
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    private static readonly HashSet<string> ValidStatuses = ["Going", "Maybe", "NotGoing"];
    private static readonly HashSet<string> ValidEventTypes = ["NappyBraai", "BabyShower"];

    [HttpPost]
    public async Task<ActionResult> Rsvp(string slug, CreateRsvpDto dto)
    {
        if (!ValidStatuses.Contains(dto.Status))
            return BadRequest("Status must be Going, Maybe, or NotGoing.");

        if (!ValidEventTypes.Contains(dto.EventType))
            return BadRequest("EventType must be NappyBraai or BabyShower.");

        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        if (@event.EventDate.HasValue)
        {
            var cutoff = @event.EventDate.Value.AddDays(-@event.RsvpDeadlineDays);
            if (DateTime.UtcNow >= cutoff)
                return BadRequest("RSVPs are closed for this event.");
        }

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

        var existing = await db.Rsvps
            .FirstOrDefaultAsync(r => r.UserId == user.Id && r.EventId == @event.Id && r.EventType == dto.EventType);

        if (existing != null)
        {
            existing.Status = dto.Status;
            existing.Message = dto.Message;
            existing.Timestamp = DateTime.UtcNow;
        }
        else
        {
            db.Rsvps.Add(new Rsvp
            {
                UserId = user.Id,
                EventId = @event.Id,
                Status = dto.Status,
                EventType = dto.EventType,
                Message = dto.Message,
            });
        }

        await db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<MyRsvpDto>>> GetMine(string slug, [FromQuery] string? guestToken)
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

        var rsvps = await db.Rsvps
            .Where(r => r.UserId == user.Id && r.EventId == @event.Id)
            .ToListAsync();

        return Ok(rsvps.Select(r => new MyRsvpDto(r.Status, r.Message, r.EventType)));
    }

    [HttpGet]
    [Authorize(Roles = "Host,Admin")]
    public async Task<ActionResult<IEnumerable<RsvpDto>>> GetAll(string slug)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        if (!User.IsInRole("Admin"))
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (@event.HostId != userId) return Forbid();
        }

        var rsvps = await db.Rsvps
            .Include(r => r.User)
            .Where(r => r.EventId == @event.Id)
            .OrderBy(r => r.EventType)
            .ThenBy(r => r.Timestamp)
            .Select(r => new RsvpDto(r.Id, r.User.FirstName, r.User.LastName, r.Status, r.Message, r.Timestamp, r.EventType))
            .ToListAsync();

        return Ok(rsvps);
    }
}
