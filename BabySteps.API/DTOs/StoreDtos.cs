namespace BabySteps.API.DTOs;

public record StoreDto(int Id, string Name, string? FeatureImageURL);
public record CreateStoreDto(string Name, string? FeatureImageURL);
