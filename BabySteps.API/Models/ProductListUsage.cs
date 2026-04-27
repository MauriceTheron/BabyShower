namespace BabySteps.API.Models;

public class ProductListUsage
{
    public int Id { get; set; }
    public int ProductListId { get; set; }
    public ProductList ProductList { get; set; } = null!;
    public string HostId { get; set; } = string.Empty;
    public ApplicationUser Host { get; set; } = null!;
    public DateTime UsedAt { get; set; } = DateTime.UtcNow;
}
