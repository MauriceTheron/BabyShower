using System.Text.Json;

namespace BabySteps.API.Services;

public class CaptchaService(IHttpClientFactory httpClientFactory, IConfiguration config) : ICaptchaService
{
    public async Task<bool> ValidateAsync(string token)
    {
        var secret = config["Captcha:SecretKey"];

        // Skip validation if no secret key is configured (dev/test mode)
        if (string.IsNullOrWhiteSpace(secret) || secret == "YOUR_HCAPTCHA_SECRET_KEY")
            return true;

        var client = httpClientFactory.CreateClient();
        var response = await client.PostAsync(
            "https://api.hcaptcha.com/siteverify",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = secret,
                ["response"] = token
            }));

        if (!response.IsSuccessStatusCode) return false;

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
    }
}
