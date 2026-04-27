using BabySteps.API.Data;
using BabySteps.API.DTOs;
using BabySteps.API.Models;
using BabySteps.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    TokenService tokenService,
    ICaptchaService captchaService,
    ApplicationDbContext db) : ControllerBase
{
    [HttpPost("guest/register")]
    public async Task<ActionResult<AuthResponseDto>> RegisterGuest(GuestRegisterDto dto)
    {
        var guestToken = Guid.NewGuid().ToString("N")[..8].ToUpper();
        var username = $"guest_{guestToken}";

        var user = new ApplicationUser
        {
            UserName = username,
            Email = $"{username}@babyshower.guest",
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            GuestToken = guestToken
        };

        var result = await userManager.CreateAsync(user, $"Guest@{guestToken}!");
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        await userManager.AddToRoleAsync(user, "User");
        var token = await tokenService.CreateTokenAsync(user);

        return Ok(new AuthResponseDto(token, user.Id, user.FirstName, user.LastName, "User"));
    }

    [HttpPost("host/register")]
    public async Task<ActionResult<HostAuthResponseDto>> RegisterHost(HostRegisterDto dto)
    {
        var captchaValid = await captchaService.ValidateAsync(dto.CaptchaToken);
        if (!captchaValid)
            return BadRequest("Captcha validation failed. Please try again.");

        if (await userManager.FindByEmailAsync(dto.Email) != null)
            return BadRequest("An account with this email already exists.");

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            PhoneCountryCode = dto.PhoneCountryCode,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        await userManager.AddToRoleAsync(user, "Host");

        var token = await tokenService.CreateTokenAsync(user);
        return Ok(new HostAuthResponseDto(token, user.Id, user.FirstName, user.LastName, "Host", null));
    }

    [HttpPost("host/login")]
    public async Task<ActionResult<HostAuthResponseDto>> HostLogin(HostLoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized("Invalid credentials.");

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains("Host"))
            return Forbid();

        var existingEvent = await db.Events.FirstOrDefaultAsync(e => e.HostId == user.Id);
        var token = await tokenService.CreateTokenAsync(user);

        return Ok(new HostAuthResponseDto(token, user.Id, user.FirstName, user.LastName, "Host", existingEvent?.Slug));
    }

    [HttpPost("admin/login")]
    public async Task<ActionResult<AuthResponseDto>> AdminLogin(AdminLoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized("Invalid credentials");

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains("Admin") && !roles.Contains("SuperAdmin"))
            return Forbid();

        var displayRole = roles.Contains("SuperAdmin") ? "SuperAdmin" : "Admin";
        var token = await tokenService.CreateTokenAsync(user);
        return Ok(new AuthResponseDto(token, user.Id, user.FirstName, user.LastName, displayRole));
    }
}
