using BabySteps.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BabySteps.API.Controllers;

public record ScrapeRequestDto(string Url);

[ApiController]
[Route("api/product-scraper")]
[Authorize(Roles = "Host,Admin")]
public class ProductScraperController(IProductScraperService scraper) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ProductScrapeResult>> Scrape([FromBody] ScrapeRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Url) ||
            !Uri.TryCreate(dto.Url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            return BadRequest("A valid HTTP/HTTPS URL is required.");
        }

        try
        {
            var result = await scraper.ScrapeAsync(dto.Url);
            return Ok(result);
        }
        catch (HttpRequestException)
        {
            return BadRequest("Could not reach the product page. Check the URL and try again.");
        }
        catch (Exception)
        {
            return BadRequest("Failed to fetch product information from the URL.");
        }
    }
}
