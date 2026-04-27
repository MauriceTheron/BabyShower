using System.Security.Claims;
using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api/events/{slug}/stores")]
public class StoresController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StoreDto>>> GetAll(string slug)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        var stores = await db.Stores
            .Where(s => s.EventId == @event.Id)
            .Select(s => new StoreDto(s.Id, s.Name, s.FeatureImageURL))
            .ToListAsync();
        return Ok(stores);
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpPost]
    public async Task<ActionResult<StoreDto>> Create(string slug, CreateStoreDto dto)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var store = new Store { Name = dto.Name, FeatureImageURL = dto.FeatureImageURL, EventId = @event.Id };
        db.Stores.Add(store);
        await db.SaveChangesAsync();
        return Ok(new StoreDto(store.Id, store.Name, store.FeatureImageURL));
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string slug, int id, CreateStoreDto dto)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var store = await db.Stores.FirstOrDefaultAsync(s => s.Id == id && s.EventId == @event.Id);
        if (store == null) return NotFound();
        store.Name = dto.Name;
        store.FeatureImageURL = dto.FeatureImageURL;
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

        var store = await db.Stores.FirstOrDefaultAsync(s => s.Id == id && s.EventId == @event.Id);
        if (store == null) return NotFound();
        db.Stores.Remove(store);
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
