using Microsoft.AspNetCore.Identity;

namespace BabySteps.API.Models;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? GuestToken { get; set; }
    public string? PhoneCountryCode { get; set; }
    public ICollection<Reservation> Reservations { get; set; } = [];
    public ICollection<Rsvp> Rsvps { get; set; } = [];
    public Event? HostedEvent { get; set; }
}
