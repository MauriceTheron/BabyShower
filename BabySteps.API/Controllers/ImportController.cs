using System.Globalization;
using System.Security.Claims;
using System.Text.RegularExpressions;
using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api")]
[Authorize(Roles = "Host,Admin")]
public class ImportController(ApplicationDbContext db, IHttpClientFactory httpClientFactory) : ControllerBase
{
    [HttpPost("import/thingstogetme/parse")]
    public async Task<ActionResult<List<ImportedItemDto>>> ParseThingsToGetMe([FromBody] ThingsToGetMeParseRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Url) ||
            !Uri.TryCreate(dto.Url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            return BadRequest("A valid HTTP/HTTPS URL is required.");

        if (!uri.Host.Contains("thingstogetme.com", StringComparison.OrdinalIgnoreCase))
            return BadRequest("URL must be from thingstogetme.com.");

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36");
        client.Timeout = TimeSpan.FromSeconds(30);

        try
        {
            var response = await client.GetAsync(dto.Url);
            response.EnsureSuccessStatusCode();
            var html = await response.Content.ReadAsStringAsync();
            return Ok(ParseHtml(html));
        }
        catch (HttpRequestException)
        {
            return BadRequest("Could not fetch the page. Check the URL and try again.");
        }
        catch (Exception)
        {
            return BadRequest("Failed to parse the wishlist page.");
        }
    }

    [HttpPost("events/{slug}/import")]
    public async Task<ActionResult<ImportResultDto>> ImportItems(string slug, ThingsToGetMeImportRequest dto)
    {
        var @event = await db.Events
            .Include(e => e.Categories)
            .Include(e => e.Stores)
            .FirstOrDefaultAsync(e => e.Slug == slug);

        if (@event == null) return NotFound("Event not found.");
        if (!await IsAuthorizedForEvent(@event)) return Forbid();

        var existingNames = await db.Products
            .Where(p => p.EventId == @event.Id)
            .Select(p => p.Name.ToLower())
            .ToHashSetAsync();

        var categoryCache = @event.Categories.ToDictionary(c => c.Name.ToLower());
        var storeCache = @event.Stores.ToDictionary(s => s.Name.ToLower());

        int imported = 0, skipped = 0;

        foreach (var item in dto.Items)
        {
            if (existingNames.Contains(item.Name.ToLower()))
            {
                skipped++;
                continue;
            }

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
                Brand = "",
                Price = item.Price,
                ImageURL = item.ImageURL,
                ProductURL = item.ProductURL,
                Notes = item.Notes,
                IsPriority = item.IsPriority,
                IsNappyList = false,
                StockQuantity = item.Quantity < 1 ? 1 : item.Quantity,
                CategoryId = category.Id,
                StoreId = store.Id,
                EventId = @event.Id
            });
            existingNames.Add(item.Name.ToLower());
            imported++;
        }

        await db.SaveChangesAsync();
        return Ok(new ImportResultDto(imported, skipped));
    }

    private static List<ImportedItemDto> ParseHtml(string html)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var items = new List<ImportedItemDto>();
        var container = doc.DocumentNode.SelectSingleNode("//div[@class='guest-items']");
        if (container == null) return items;

        var currentCategory = "General";

        foreach (var child in container.ChildNodes)
        {
            if (child.NodeType != HtmlNodeType.Element) continue;

            if (child.Name == "h2")
            {
                var rawHeading = HtmlEntity.DeEntitize(child.InnerText).Trim();
                currentCategory = Regex.Replace(rawHeading, @"\s+", " ").Trim();
                continue;
            }

            var classAttr = child.GetAttributeValue("class", "");
            if (!classAttr.Split(' ').Contains("guest-item")) continue;

            var nameNode = child.SelectSingleNode(".//p[@class='guest-item-name']/a");
            if (nameNode == null) continue;

            var rawName = HtmlEntity.DeEntitize(nameNode.InnerText).Trim();

            // Extract [StoreName] from product name if present
            var storeMatch = Regex.Match(rawName, @"\s*\[([^\]]+)\]\s*$");
            string storeName;
            string cleanName;
            if (storeMatch.Success)
            {
                storeName = storeMatch.Groups[1].Value.Trim();
                cleanName = rawName[..storeMatch.Index].Trim();
            }
            else
            {
                cleanName = rawName;
                storeName = null!;
            }

            var notesNode = child.SelectSingleNode(".//p[@class='guest-item-note']");
            var notes = notesNode != null ? HtmlEntity.DeEntitize(notesNode.InnerText).Trim() : null;
            if (string.IsNullOrEmpty(notes)) notes = null;

            var price = ParsePrice(child);
            var quantity = ParseQuantity(child);
            var imageURL = ExtractImageUrl(child);
            var productURL = ExtractProductUrl(child);

            if (string.IsNullOrEmpty(storeName))
                storeName = DeriveStoreName(productURL);

            var isPriority = child.SelectSingleNode(
                ".//span[contains(@class,'high-priority-badge')]") != null;

            items.Add(new ImportedItemDto(
                cleanName, notes, price, imageURL, productURL,
                quantity, isPriority, currentCategory, storeName));
        }

        return items;
    }

    private static decimal ParsePrice(HtmlNode item)
    {
        var node = item.SelectSingleNode(".//p[@class='guest-item-price']/a");
        if (node == null) return 0;
        var text = HtmlEntity.DeEntitize(node.InnerText).Trim();
        var cleaned = Regex.Replace(text, @"[^\d.,]", "").Replace(",", ".");
        var firstNum = Regex.Match(cleaned, @"\d+(\.\d+)?");
        if (firstNum.Success && decimal.TryParse(firstNum.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var price))
            return price;
        return 0;
    }

    private static int ParseQuantity(HtmlNode item)
    {
        var node = item.SelectSingleNode(".//p[@class='guest-item-quantity']/a");
        if (node == null) return 1;
        var m = Regex.Match(HtmlEntity.DeEntitize(node.InnerText), @"\d+");
        return m.Success && int.TryParse(m.Value, out var qty) ? qty : 1;
    }

    private static string? ExtractImageUrl(HtmlNode item)
    {
        var span = item.SelectSingleNode(
            ".//span[contains(@class,'guest-item-image') and not(contains(@class,'guest-item-image-padding')) and not(contains(@class,'guest-item-image-missing'))]");
        if (span == null) return null;
        var style = span.GetAttributeValue("style", "");
        var m = Regex.Match(style, @"url\([""']?([^""')]+)[""']?\)");
        return m.Success ? m.Groups[1].Value : null;
    }

    private static string? ExtractProductUrl(HtmlNode item)
    {
        var node = item.SelectSingleNode(".//p[@class='guest-item-url']/a");
        if (node == null) return null;
        var text = HtmlEntity.DeEntitize(node.InnerText).Trim();
        return Uri.TryCreate(text, UriKind.Absolute, out _) ? text : null;
    }

    private static string DeriveStoreName(string? url)
    {
        if (!string.IsNullOrEmpty(url) && Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            var host = uri.Host.ToLower().Replace("www.", "");
            return host switch
            {
                "takealot.com" => "Takealot",
                "clicks.co.za" => "Clicks",
                "dischem.co.za" => "Dischem",
                "babycity.co.za" => "Baby City",
                "babiesrus.co.za" => "Babies R Us",
                "ackermans.co.za" => "Ackermans",
                "woolworths.co.za" => "Woolworths",
                "temu.com" => "Temu",
                "toysrus.co.za" => "Toys R Us",
                "game.co.za" => "Game",
                "makro.co.za" => "Makro",
                _ => "Other"
            };
        }
        return "Other";
    }

    private async Task<bool> IsAuthorizedForEvent(Event @event)
    {
        if (User.IsInRole("Admin")) return true;
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return @event.HostId == userId;
    }
}
