using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

/// <summary>
/// Handles user authentication, JWT token generation and refresh, and session management.
/// Supports multi-role authentication (SystemOwner, Manager, Employee) with token-based security.
/// </summary>
public interface IAuthService
{
    /// <summary>Authenticates user with email/password and returns JWT tokens</summary>
    /// <param name="request">Login credentials (email, password)</param>
    /// <returns>JWT access token and refresh token for authenticated user</returns>
    /// <exception cref="InvalidOperationException">Invalid credentials or user not found</exception>
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);

    /// <summary>Refreshes an expired access token using a valid refresh token</summary>
    /// <param name="refreshToken">Current refresh token from user session</param>
    /// <returns>New JWT access token with extended expiration</returns>
    /// <exception cref="UnauthorizedAccessException">Refresh token invalid or expired</exception>
    Task<RefreshTokenResponseDto> RefreshTokenAsync(string refreshToken);

    /// <summary>Registers a new SystemOwner user (SystemOwner role only)</summary>
    /// <param name="request">Registration details (email, password, name, role)</param>
    /// <returns>Newly created user information</returns>
    /// <exception cref="InvalidOperationException">Email already registered or invalid data</exception>
    Task<UserDto> RegisterAsync(RegisterRequestDto request);

    /// <summary>Logs out user and invalidates refresh tokens</summary>
    /// <param name="userId">ID of user to log out</param>
    Task LogoutAsync(int userId);
}
