namespace BabySteps.API.Models;

public class ProductListItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageURL { get; set; }
    public bool IsPriority { get; set; }
    public bool IsNappyList { get; set; }
    public int StockQuantity { get; set; } = 1;
    public string CategoryName { get; set; } = string.Empty;
    public string StoreName { get; set; } = string.Empty;

    public int ProductListId { get; set; }
    public ProductList ProductList { get; set; } = null!;
}
