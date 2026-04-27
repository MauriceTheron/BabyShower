namespace BabySteps.API.Models;

public class ProductList
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsAuto { get; set; } = false;
    public string? HostId { get; set; }
    public ApplicationUser? Host { get; set; }
    public DateTime? LastUpdated { get; set; }
    public ICollection<ProductListItem> Items { get; set; } = [];
    public ICollection<ProductListUsage> Usages { get; set; } = [];
}
