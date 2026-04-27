namespace BabySteps.API.Models;

public class Store
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? FeatureImageURL { get; set; }
    public ICollection<Product> Products { get; set; } = [];

    public int? EventId { get; set; }
    public Event? Event { get; set; }
}
