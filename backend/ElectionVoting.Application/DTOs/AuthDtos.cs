namespace ElectionVoting.Application.DTOs;

public record LoginRequestDto(string Email, string Password);

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    UserDto User);

public record RefreshTokenRequestDto(string RefreshToken);

public record RefreshTokenResponseDto(string AccessToken);

public record RegisterRequestDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    int RoleId);

public record UserDto(
    int UserId,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    int? OrganizationId);
