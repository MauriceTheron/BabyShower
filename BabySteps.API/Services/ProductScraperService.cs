using System.Globalization;
using System.Text.RegularExpressions;
using HtmlAgilityPack;

namespace BabySteps.API.Services;

public class ProductScraperService(IHttpClientFactory httpClientFactory) : IProductScraperService
{
    public async Task<ProductScrapeResult> ScrapeAsync(string url)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36");
        client.Timeout = TimeSpan.FromSeconds(15);

        var response = await client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var html = await response.Content.ReadAsStringAsync();
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var name = GetOgMeta(doc, "og:title")
                   ?? GetOgMeta(doc, "twitter:title")
                   ?? doc.DocumentNode.SelectSingleNode("//title")?.InnerText?.Trim();

        var imageURL = GetOgMeta(doc, "og:image")
                       ?? GetOgMeta(doc, "twitter:image")
                       ?? GetOgMeta(doc, "twitter:image:src");

        var priceStr = GetOgMeta(doc, "og:price:amount")
                       ?? GetOgMeta(doc, "product:price:amount")
                       ?? GetOgMeta(doc, "og:price");

        decimal? price = null;
        if (!string.IsNullOrWhiteSpace(priceStr))
        {
            // Strip currency symbols and whitespace before parsing
            var cleaned = Regex.Replace(priceStr, @"[^\d.,]", "").Replace(",", ".");
            if (decimal.TryParse(cleaned, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
                price = parsed;
        }

        // Clean up HTML entities in name
        if (name != null)
            name = HtmlEntity.DeEntitize(name).Trim();

        return new ProductScrapeResult(name, imageURL, price);
    }

    private static string? GetOgMeta(HtmlDocument doc, string property)
    {
        var byProperty = doc.DocumentNode
            .SelectSingleNode($"//meta[@property='{property}']");
        if (byProperty != null)
            return byProperty.GetAttributeValue("content", string.Empty) is { Length: > 0 } v1 ? v1 : null;

        var byName = doc.DocumentNode
            .SelectSingleNode($"//meta[@name='{property}']");
        return byName?.GetAttributeValue("content", string.Empty) is { Length: > 0 } v2 ? v2 : null;
    }
}
