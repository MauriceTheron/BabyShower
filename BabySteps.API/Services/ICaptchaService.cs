namespace BabySteps.API.Services;

public interface ICaptchaService
{
    Task<bool> ValidateAsync(string token);
}
