using System.Security.Claims;
using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api/events/{slug}/products")]
public class ProductsController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll(
        string slug,
        [FromQuery] int? categoryId,
        [FromQuery] int? storeId,
        [FromQuery] bool? isPriority,
        [FromQuery] bool? isNappyList,
        [FromQuery] string? search)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        var query = db.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .Where(p => p.EventId == @event.Id)
            .AsQueryable();

        if (categoryId.HasValue) query = query.Where(p => p.CategoryId == categoryId);
        if (storeId.HasValue) query = query.Where(p => p.StoreId == storeId);
        if (isPriority.HasValue) query = query.Where(p => p.IsPriority == isPriority);
        if (isNappyList.HasValue) query = query.Where(p => p.IsNappyList == isNappyList);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query
                .Where(p => p.Name.ToLower().Contains(s) ||
                            p.Brand.ToLower().Contains(s) ||
                            p.Category.Name.ToLower().Contains(s) ||
                            p.Store.Name.ToLower().Contains(s))
                .OrderBy(p => p.Name.ToLower() == s ? 0 :
                              p.Name.ToLower().StartsWith(s) ? 1 : 2)
                .ThenBy(p => p.Name);
        }

        var products = await query
            .Select(p => new ProductDto(
                p.Id, p.Name, p.Brand, p.Price, p.ImageURL, p.ProductURL, p.Notes, p.IsPriority, p.IsNappyList,
                p.StockQuantity,
                p.Reservations.Sum(r => r.Quantity),
                p.CategoryId, p.Category.Name, p.StoreId, p.Store.Name))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(string slug, int id)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");

        var p = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .Include(p => p.Reservations)
            .FirstOrDefaultAsync(p => p.Id == id && p.EventId == @event.Id);

        if (p == null) return NotFound();

        return Ok(new ProductDto(
            p.Id, p.Name, p.Brand, p.Price, p.ImageURL, p.ProductURL, p.Notes, p.IsPriority, p.IsNappyList,
            p.StockQuantity,
            p.Reservations.Sum(r => r.Quantity),
            p.CategoryId, p.Category.Name, p.StoreId, p.Store.Name));
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(string slug, CreateProductDto dto)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var product = new Product
        {
            Name = dto.Name,
            Brand = dto.Brand,
            Price = dto.Price,
            ImageURL = dto.ImageURL,
            ProductURL = dto.ProductURL,
            Notes = dto.Notes,
            IsPriority = dto.IsPriority,
            IsNappyList = dto.IsNappyList,
            StockQuantity = dto.StockQuantity < 1 ? 1 : dto.StockQuantity,
            CategoryId = dto.CategoryId,
            StoreId = dto.StoreId,
            EventId = @event.Id
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        await db.Entry(product).Reference(p => p.Category).LoadAsync();
        await db.Entry(product).Reference(p => p.Store).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { slug, id = product.Id }, new ProductDto(
            product.Id, product.Name, product.Brand, product.Price, product.ImageURL, product.ProductURL, product.Notes,
            product.IsPriority, product.IsNappyList,
            product.StockQuantity, 0,
            product.CategoryId, product.Category.Name, product.StoreId, product.Store.Name));
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string slug, int id, UpdateProductDto dto)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.EventId == @event.Id);
        if (product == null) return NotFound();

        product.Name = dto.Name;
        product.Brand = dto.Brand;
        product.Price = dto.Price;
        product.ImageURL = dto.ImageURL;
        product.ProductURL = dto.ProductURL;
        product.Notes = dto.Notes;
        product.IsPriority = dto.IsPriority;
        product.IsNappyList = dto.IsNappyList;
        product.StockQuantity = dto.StockQuantity < 1 ? 1 : dto.StockQuantity;
        product.CategoryId = dto.CategoryId;
        product.StoreId = dto.StoreId;

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

        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.EventId == @event.Id);
        if (product == null) return NotFound();
        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Host,Admin")]
    [HttpPatch("{id}/priority")]
    public async Task<IActionResult> TogglePriority(string slug, int id)
    {
        var @event = await db.Events.FirstOrDefaultAsync(e => e.Slug == slug);
        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.EventId == @event.Id);
        if (product == null) return NotFound();
        product.IsPriority = !product.IsPriority;
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
