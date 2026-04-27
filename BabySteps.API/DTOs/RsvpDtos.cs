namespace BabySteps.API.DTOs;

public record CreateRsvpDto(string Status, string? Message, string GuestToken, string EventType);

public record MyRsvpDto(string Status, string? Message, string EventType);

public record RsvpDto(
    int Id,
    string UserFirstName,
    string UserLastName,
    string Status,
    string? Message,
    DateTime Timestamp,
    string EventType
);
