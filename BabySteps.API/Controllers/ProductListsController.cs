using System.Security.Claims;
using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api/product-lists")]
public class ProductListsController(ApplicationDbContext db) : ControllerBase
{
    private const string MostPopularName = "Most Popular Products";
    private static readonly TimeSpan AutoListStaleness = TimeSpan.FromHours(1);

    [HttpGet]
    [Authorize(Roles = "Admin,Host,SuperAdmin")]
    public async Task<ActionResult<IEnumerable<ProductListSummaryDto>>> GetAll()
    {
        await EnsureAutoListsRefreshed();

        var usageCounts = await db.ProductListUsages
            .Select(u => new { u.ProductListId, u.HostId })
            .Distinct()
            .GroupBy(u => u.ProductListId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        var lists = await db.ProductLists
            .Select(l => new
            {
                l.Id, l.Name, l.Description, l.IsAuto, l.HostId,
                HostName = l.Host != null ? l.Host.FirstName + " " + l.Host.LastName : null,
                ItemCount = l.Items.Count
            })
            .ToListAsync();

        var result = lists
            .Select(l => new ProductListSummaryDto(
                l.Id, l.Name, l.Description, l.ItemCount,
                l.IsAuto, l.HostId, l.HostName,
                usageCounts.GetValueOrDefault(l.Id)))
            .OrderBy(l => l.IsAuto ? 0 : 1)
            .ThenByDescending(l => l.UsageCount);

        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Host,SuperAdmin")]
    public async Task<ActionResult<ProductListDto>> GetById(int id)
    {
        var list = await db.ProductLists
            .Include(l => l.Items)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null) return NotFound();

        return Ok(new ProductListDto(list.Id, list.Name, list.Description,
            list.Items.Select(i => new ProductListItemDto(
                i.Id, i.Name, i.Brand, i.Price, i.ImageURL,
                i.IsPriority, i.IsNappyList, i.StockQuantity,
                i.CategoryName, i.StoreName))));
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<ProductListDto>> Create(CreateProductListDto dto)
    {
        var list = new ProductList { Name = dto.Name, Description = dto.Description };
        db.ProductLists.Add(list);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = list.Id },
            new ProductListDto(list.Id, list.Name, list.Description, []));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Update(int id, UpdateProductListDto dto)
    {
        var list = await db.ProductLists.FindAsync(id);
        if (list == null) return NotFound();
        list.Name = dto.Name;
        list.Description = dto.Description;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var list = await db.ProductLists.FindAsync(id);
        if (list == null) return NotFound();
        db.ProductLists.Remove(list);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/items")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<ProductListItemDto>> AddItem(int id, CreateProductListItemDto dto)
    {
        var list = await db.ProductLists.FindAsync(id);
        if (list == null) return NotFound();

        var item = new ProductListItem
        {
            Name = dto.Name,
            Brand = dto.Brand,
            Price = dto.Price,
            ImageURL = dto.ImageURL,
            IsPriority = dto.IsPriority,
            IsNappyList = dto.IsNappyList,
            StockQuantity = dto.StockQuantity < 1 ? 1 : dto.StockQuantity,
            CategoryName = dto.CategoryName,
            StoreName = dto.StoreName,
            ProductListId = id
        };
        db.ProductListItems.Add(item);
        await db.SaveChangesAsync();

        return Ok(new ProductListItemDto(item.Id, item.Name, item.Brand, item.Price, item.ImageURL,
            item.IsPriority, item.IsNappyList, item.StockQuantity, item.CategoryName, item.StoreName));
    }

    [HttpPut("{id}/items/{itemId}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> UpdateItem(int id, int itemId, UpdateProductListItemDto dto)
    {
        var item = await db.ProductListItems.FirstOrDefaultAsync(i => i.Id == itemId && i.ProductListId == id);
        if (item == null) return NotFound();

        item.Name = dto.Name;
        item.Brand = dto.Brand;
        item.Price = dto.Price;
        item.ImageURL = dto.ImageURL;
        item.IsPriority = dto.IsPriority;
        item.IsNappyList = dto.IsNappyList;
        item.StockQuantity = dto.StockQuantity < 1 ? 1 : dto.StockQuantity;
        item.CategoryName = dto.CategoryName;
        item.StoreName = dto.StoreName;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}/items/{itemId}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> DeleteItem(int id, int itemId)
    {
        var item = await db.ProductListItems.FirstOrDefaultAsync(i => i.Id == itemId && i.ProductListId == id);
        if (item == null) return NotFound();
        db.ProductListItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Host saves their current event products as a community template
    [HttpPost("from-event/{slug}")]
    [Authorize(Roles = "Host")]
    public async Task<ActionResult<ProductListSummaryDto>> SaveAsTemplate(string slug, SaveAsTemplateDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var @event = await db.Events
            .FirstOrDefaultAsync(e => e.Slug == slug && e.HostId == hostId);
        if (@event == null) return Forbid();

        var products = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .Where(p => p.EventId == @event.Id)
            .ToListAsync();

        var list = new ProductList
        {
            Name = dto.Name,
            Description = dto.Description,
            HostId = hostId,
            IsAuto = false,
            LastUpdated = DateTime.UtcNow
        };
        db.ProductLists.Add(list);
        await db.SaveChangesAsync();

        foreach (var p in products)
        {
            db.ProductListItems.Add(new ProductListItem
            {
                Name = p.Name,
                Brand = p.Brand,
                Price = p.Price,
                ImageURL = p.ImageURL,
                IsPriority = p.IsPriority,
                IsNappyList = p.IsNappyList,
                StockQuantity = p.StockQuantity,
                CategoryName = p.Category?.Name ?? "General",
                StoreName = p.Store?.Name ?? "General",
                ProductListId = list.Id
            });
        }
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = list.Id },
            new ProductListSummaryDto(list.Id, list.Name, list.Description, products.Count,
                false, hostId, null, 0));
    }

    // Host updates their own community template (name/description only)
    [HttpPut("mine/{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> UpdateMine(int id, UpdateProductListDto dto)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var list = await db.ProductLists.FirstOrDefaultAsync(l => l.Id == id && l.HostId == hostId);
        if (list == null) return NotFound();

        list.Name = dto.Name;
        list.Description = dto.Description;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Host deletes their own community template
    [HttpDelete("mine/{id}")]
    [Authorize(Roles = "Host")]
    public async Task<IActionResult> DeleteMine(int id)
    {
        var hostId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var list = await db.ProductLists.FirstOrDefaultAsync(l => l.Id == id && l.HostId == hostId);
        if (list == null) return NotFound();

        db.ProductLists.Remove(list);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task EnsureAutoListsRefreshed()
    {
        var autoList = await db.ProductLists
            .Include(l => l.Items)
            .FirstOrDefaultAsync(l => l.IsAuto && l.Name == MostPopularName);

        if (autoList == null)
        {
            autoList = new ProductList
            {
                Name = MostPopularName,
                Description = "The most-added products across all registries.",
                IsAuto = true
            };
            db.ProductLists.Add(autoList);
            await db.SaveChangesAsync();
        }

        if (autoList.LastUpdated.HasValue && DateTime.UtcNow - autoList.LastUpdated.Value < AutoListStaleness)
            return;

        var popular = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Store)
            .GroupBy(p => new { NameKey = p.Name.ToLower(), BrandKey = p.Brand.ToLower() })
            .Select(g => new
            {
                Count = g.Count(),
                Sample = g.OrderByDescending(p => p.Id).First()
            })
            .OrderByDescending(x => x.Count)
            .Take(20)
            .ToListAsync();

        db.ProductListItems.RemoveRange(autoList.Items);

        foreach (var entry in popular)
        {
            db.ProductListItems.Add(new ProductListItem
            {
                Name = entry.Sample.Name,
                Brand = entry.Sample.Brand,
                Price = entry.Sample.Price,
                ImageURL = entry.Sample.ImageURL,
                IsPriority = false,
                IsNappyList = entry.Sample.IsNappyList,
                StockQuantity = 1,
                CategoryName = entry.Sample.Category?.Name ?? "General",
                StoreName = entry.Sample.Store?.Name ?? "General",
                ProductListId = autoList.Id
            });
        }

        autoList.LastUpdated = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
}
