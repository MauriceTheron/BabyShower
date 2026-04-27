namespace BabySteps.API.Services;

public record ProductScrapeResult(string? Name, string? ImageURL, decimal? Price);

public interface IProductScraperService
{
    Task<ProductScrapeResult> ScrapeAsync(string url);
}
