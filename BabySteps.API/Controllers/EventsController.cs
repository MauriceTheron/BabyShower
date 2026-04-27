using System.Security.Claims;
using System.Text.RegularExpressions;
using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<EventDto>>> GetAll()
    {
        var events = await db.Events
            .Include(e => e.Host)
            .Select(e => new EventDto(e.Id, e.Name, e.Slug, e.Host.FirstName, e.Host.LastName, e.IsActive, e.CreatedAt, e.EventDate, e.Location, e.LocationUrl, e.ThankYouNote, e.HeroImageUrl, e.PrimaryColor, e.SecondaryColor, e.AccentColor, e.RsvpDeadlineDays))
            .ToListAsync();
        return Ok(events);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<EventDto>> GetMyEvent()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var @event = await db.Events
            .Include(e => e.Host)
            .FirstOrDefaultAsync(e => e.HostId == userId);

        if (@event == null) return NotFound();

        return Ok(new EventDto(@event.Id, @event.Name, @event.Slug, @event.Host.FirstName, @event.Host.LastName, @event.IsActive, @event.CreatedAt, @event.EventDate, @event.Location, @event.LocationUrl, @event.ThankYouNote, @event.HeroImageUrl, @event.PrimaryColor, @event.SecondaryColor, @event.AccentColor, @event.RsvpDeadlineDays));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<EventDto>> GetBySlug(string slug)
    {
        var @event = await db.Events
            .Include(e => e.Host)
            .FirstOrDefaultAsync(e => e.Slug == slug && e.IsActive);

        if (@event == null) return NotFound();

        return Ok(new EventDto(@event.Id, @event.Name, @event.Slug, @event.Host.FirstName, @event.Host.LastName, @event.IsActive, @event.CreatedAt, @event.EventDate, @event.Location, @event.LocationUrl, @event.ThankYouNote, @event.HeroImageUrl, @event.PrimaryColor, @event.SecondaryColor, @event.AccentColor, @event.RsvpDeadlineDays));
    }

    [HttpPost]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<EventDto>> Create(CreateEventDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (await db.Events.AnyAsync(e => e.HostId == userId))
            return BadRequest("You already have an event. A host can only have one event.");

        var slug = await GenerateUniqueSlug(dto.Name);

        var @event = new Event
        {
            Name = dto.Name,
            Slug = slug,
            HostId = userId!,
            CreatedAt = DateTime.UtcNow
        };

        db.Events.Add(@event);
        await db.SaveChangesAsync();
        await db.Entry(@event).Reference(e => e.Host).LoadAsync();

        return CreatedAtAction(nameof(GetBySlug), new { slug = @event.Slug },
            new EventDto(@event.Id, @event.Name, @event.Slug, @event.Host.FirstName, @event.Host.LastName, @event.IsActive, @event.CreatedAt, null, null, null, null, null, null, null, null, 5));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Host,Admin")]
    public async Task<IActionResult> Update(int id, UpdateEventDto dto)
    {
        var @event = await db.Events.FindAsync(id);
        if (@event == null) return NotFound();

        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        @event.Name = dto.Name;
        @event.IsActive = dto.IsActive;
        @event.EventDate = dto.EventDate.HasValue
            ? DateTime.SpecifyKind(dto.EventDate.Value, DateTimeKind.Utc)
            : null;
        @event.Location = dto.Location;
        @event.LocationUrl = dto.LocationUrl;
        @event.ThankYouNote = dto.ThankYouNote;
        @event.HeroImageUrl = dto.HeroImageUrl;
        @event.PrimaryColor = dto.PrimaryColor;
        @event.SecondaryColor = dto.SecondaryColor;
        @event.AccentColor = dto.AccentColor;
        @event.RsvpDeadlineDays = dto.RsvpDeadlineDays > 0 ? dto.RsvpDeadlineDays : 0;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{slug}/seed")]
    [Authorize(Roles = "Host,Admin,SuperAdmin")]
    public async Task<IActionResult> SeedFromList(string slug, SeedEventDto dto)
    {
        var @event = await db.Events
            .Include(e => e.Categories)
            .Include(e => e.Stores)
            .FirstOrDefaultAsync(e => e.Slug == slug);

        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var list = await db.ProductLists
            .Include(l => l.Items)
            .FirstOrDefaultAsync(l => l.Id == dto.ProductListId);

        if (list == null) return NotFound("Product list not found.");

        var categoryCache = @event.Categories.ToDictionary(c => c.Name.ToLower());
        var storeCache = @event.Stores.ToDictionary(s => s.Name.ToLower());

        foreach (var item in list.Items)
        {
            if (!categoryCache.TryGetValue(item.CategoryName.ToLower(), out var category))
            {
                category = new Category { Name = item.CategoryName, EventId = @event.Id };
                db.Categories.Add(category);
                await db.SaveChangesAsync();
                categoryCache[item.CategoryName.ToLower()] = category;
            }

            if (!storeCache.TryGetValue(item.StoreName.ToLower(), out var store))
            {
                store = new Store { Name = item.StoreName, EventId = @event.Id };
                db.Stores.Add(store);
                await db.SaveChangesAsync();
                storeCache[item.StoreName.ToLower()] = store;
            }

            db.Products.Add(new Product
            {
                Name = item.Name,
                Brand = item.Brand,
                Price = item.Price,
                ImageURL = item.ImageURL,
                IsPriority = item.IsPriority,
                IsNappyList = item.IsNappyList,
                StockQuantity = item.StockQuantity,
                CategoryId = category.Id,
                StoreId = store.Id,
                EventId = @event.Id
            });
        }

        await db.SaveChangesAsync();

        // Record that this host used this list (for community usage ranking)
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null)
        {
            var alreadyRecorded = await db.ProductListUsages
                .AnyAsync(u => u.ProductListId == list.Id && u.HostId == userId);
            if (!alreadyRecorded)
            {
                db.ProductListUsages.Add(new ProductListUsage
                {
                    ProductListId = list.Id,
                    HostId = userId,
                    UsedAt = DateTime.UtcNow
                });
                await db.SaveChangesAsync();
            }
        }

        return NoContent();
    }

    private async Task<bool> IsAuthorizedForEvent(Event @event)
    {
        if (User.IsInRole("Admin")) return true;
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return @event.HostId == userId;
    }

    private async Task<string> GenerateUniqueSlug(string name)
    {
        var baseSlug = Regex.Replace(name.ToLower(), @"[^a-z0-9\s-]", "")
            .Trim()
            .Replace(" ", "-");
        baseSlug = Regex.Replace(baseSlug, @"-+", "-").Trim('-');

        if (string.IsNullOrEmpty(baseSlug)) baseSlug = "event";

        var slug = baseSlug;
        var counter = 2;
        while (await db.Events.AnyAsync(e => e.Slug == slug))
        {
            slug = $"{baseSlug}-{counter++}";
        }
        return slug;
    }
}
