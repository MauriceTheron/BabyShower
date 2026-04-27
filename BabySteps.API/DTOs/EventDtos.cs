namespace BabySteps.API.DTOs;

public record EventDto(
    int Id,
    string Name,
    string Slug,
    string HostFirstName,
    string HostLastName,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? EventDate,
    string? Location,
    string? LocationUrl,
    string? ThankYouNote,
    string? HeroImageUrl,
    string? PrimaryColor,
    string? SecondaryColor,
    string? AccentColor,
    int RsvpDeadlineDays
);

public record CreateEventDto(string Name);

public record UpdateEventDto(
    string Name,
    bool IsActive,
    DateTime? EventDate,
    string? Location,
    string? LocationUrl,
    string? ThankYouNote,
    string? HeroImageUrl,
    string? PrimaryColor,
    string? SecondaryColor,
    string? AccentColor,
    int RsvpDeadlineDays
);
