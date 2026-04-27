namespace BabySteps.API.Models;

public class Rsvp
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public int EventId { get; set; }
    public Event Event { get; set; } = null!;
    public string Status { get; set; } = string.Empty; // Going | Maybe | NotGoing
    public string EventType { get; set; } = string.Empty; // NappyBraai | BabyShower
    public string? Message { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
