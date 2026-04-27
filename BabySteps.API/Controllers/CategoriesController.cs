using System.Security.Claims;
using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api/events/{slug}/categories")]
public class CategoriesController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll(string slug)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        var categories = await db.Categories
            .Where(c => c.EventId == @event.Id)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Icon))
            .ToListAsync();
        return Ok(categories);
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(string slug, CreateCategoryDto dto)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var category = new Category { Name = dto.Name, Icon = dto.Icon, EventId = @event.Id };
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return Ok(new CategoryDto(category.Id, category.Name, category.Icon));
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string slug, int id, CreateCategoryDto dto)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.EventId == @event.Id);
        if (category == null) return NotFound();
        category.Name = dto.Name;
        category.Icon = dto.Icon;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string slug, int id)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.EventId == @event.Id);
        if (category == null) return NotFound();
        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<bool> IsAuthorizedForEvent(Event @event)
    {
        if (User.IsInRole("Admin")) return true;
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return @event.HostId == userId;
    }
}
