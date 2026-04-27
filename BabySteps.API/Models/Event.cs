namespace BabySteps.API.Models;

public class Event
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string HostId { get; set; } = string.Empty;
    public ApplicationUser Host { get; set; } = null!;

    public DateTime? EventDate { get; set; }
    public string? Location { get; set; }
    public string? LocationUrl { get; set; }
    public string? ThankYouNote { get; set; }
    public string? HeroImageUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? AccentColor { get; set; }
    public int RsvpDeadlineDays { get; set; } = 5;

    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Store> Stores { get; set; } = [];
    public ICollection<Category> Categories { get; set; } = [];
    public ICollection<Reservation> Reservations { get; set; } = [];
    public ICollection<Rsvp> Rsvps { get; set; } = [];
}
