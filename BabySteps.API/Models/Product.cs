namespace BabySteps.API.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageURL { get; set; }
    public string? ProductURL { get; set; }
    public string? Notes { get; set; }
    public bool IsPriority { get; set; }
    public bool IsNappyList { get; set; }
    public int StockQuantity { get; set; } = 1;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public int StoreId { get; set; }
    public Store Store { get; set; } = null!;

    public ICollection<Reservation> Reservations { get; set; } = [];

    public int? EventId { get; set; }
    public Event? Event { get; set; }
}
