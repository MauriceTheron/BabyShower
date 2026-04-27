namespace BabySteps.API.DTOs;

public record ProductDto(
    int Id,
    string Name,
    string Brand,
    decimal Price,
    string? ImageURL,
    string? ProductURL,
    string? Notes,
    bool IsPriority,
    bool IsNappyList,
    int StockQuantity,
    int ReservedQuantity,
    int CategoryId,
    string CategoryName,
    int StoreId,
    string StoreName
);

public record CreateProductDto(
    string Name,
    string Brand,
    decimal Price,
    string? ImageURL,
    string? ProductURL,
    string? Notes,
    bool IsPriority,
    bool IsNappyList,
    int StockQuantity,
    int CategoryId,
    int StoreId
);

public record UpdateProductDto(
    string Name,
    string Brand,
    decimal Price,
    string? ImageURL,
    string? ProductURL,
    string? Notes,
    bool IsPriority,
    bool IsNappyList,
    int StockQuantity,
    int CategoryId,
    int StoreId
);
