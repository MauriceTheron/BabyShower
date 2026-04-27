namespace BabySteps.API.DTOs;

public record GuestRegisterDto(string FirstName, string LastName);

public record AdminLoginDto(string Email, string Password);

public record HostRegisterDto(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string PhoneCountryCode,
    string Password,
    string CaptchaToken
);

public record HostLoginDto(string Email, string Password);

public record AuthResponseDto(string Token, string UserId, string FirstName, string LastName, string Role);

public record HostAuthResponseDto(
    string Token,
    string UserId,
    string FirstName,
    string LastName,
    string Role,
    string? EventSlug
);
