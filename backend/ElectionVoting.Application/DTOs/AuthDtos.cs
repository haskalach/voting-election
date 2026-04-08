using System.ComponentModel.DataAnnotations;

namespace ElectionVoting.Application.DTOs;

public record LoginRequestDto(
    [Required][EmailAddress] string Email,
    [Required][MinLength(1)] string Password);

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    UserDto User);

public record RefreshTokenRequestDto(
    [Required] string RefreshToken);

public record RefreshTokenResponseDto(string AccessToken);

public record RegisterRequestDto(
    [Required][EmailAddress] string Email,
    [Required][MinLength(8)] string Password,
    [Required][MaxLength(100)] string FirstName,
    [Required][MaxLength(100)] string LastName,
    [Range(1, int.MaxValue)] int RoleId);

public record UserDto(
    int UserId,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    int? OrganizationId);
