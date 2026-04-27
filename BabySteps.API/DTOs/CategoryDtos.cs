namespace BabySteps.API.DTOs;

public record CategoryDto(int Id, string Name, string? Icon);
public record CreateCategoryDto(string Name, string? Icon);
