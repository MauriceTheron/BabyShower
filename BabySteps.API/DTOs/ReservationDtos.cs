namespace BabySteps.API.DTOs;

public record CreateReservationDto(int ProductId, int Quantity, string GuestToken);

public record ReservationDto(
    int Id,
    string UserFirstName,
    string UserLastName,
    int ProductId,
    string ProductName,
    string ProductBrand,
    decimal ProductPrice,
    string? ProductImageURL,
    int Quantity,
    DateTime Timestamp
);
