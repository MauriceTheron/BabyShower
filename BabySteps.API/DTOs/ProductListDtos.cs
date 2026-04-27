namespace BabySteps.API.DTOs;

public record ProductListSummaryDto(
    int Id, string Name, string? Description, int ItemCount,
    bool IsAuto, string? HostId, string? HostName, int UsageCount);

public record ProductListDto(int Id, string Name, string? Description, IEnumerable<ProductListItemDto> Items);

public record ProductListItemDto(
    int Id, string Name, string Brand, decimal Price, string? ImageURL,
    bool IsPriority, bool IsNappyList, int StockQuantity,
    string CategoryName, string StoreName);

public record CreateProductListDto(string Name, string? Description);
public record UpdateProductListDto(string Name, string? Description);

public record CreateProductListItemDto(
    string Name, string Brand, decimal Price, string? ImageURL,
    bool IsPriority, bool IsNappyList, int StockQuantity,
    string CategoryName, string StoreName);

public record UpdateProductListItemDto(
    string Name, string Brand, decimal Price, string? ImageURL,
    bool IsPriority, bool IsNappyList, int StockQuantity,
    string CategoryName, string StoreName);

public record SeedEventDto(int ProductListId);

public record SaveAsTemplateDto(string Name, string? Description);
