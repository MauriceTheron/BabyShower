namespace BabySteps.API.DTOs;

public record ThingsToGetMeParseRequest(string Url);

public record ImportedItemDto(
    string Name,
    string? Notes,
    decimal Price,
    string? ImageURL,
    string? ProductURL,
    int Quantity,
    bool IsPriority,
    string CategoryName,
    string StoreName
);

public record ThingsToGetMeImportRequest(List<ImportedItemDto> Items);

public record ImportResultDto(int Imported, int Skipped);
