using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ElectionVoting.Api.Controllers;

/// <summary>
/// Handles user authentication and token management.
/// </summary>
/// <remarks>
/// Provides endpoints for:
/// - User login with email and password
/// - User registration (SystemOwner only)
/// - JWT token refresh
/// - User logout
///
/// Rate limiting: 10 requests per minute on login and refresh endpoints
/// </remarks>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    /// <summary>
    /// Initializes a new instance of the AuthController.
    /// </summary>
    /// <param name="authService">The authentication service dependency</param>
    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>
    /// Authenticates a user with email and password.
    /// </summary>
    /// <param name="request">Login credentials (email and password)</param>
    /// <returns>
    /// A LoginResponseDto containing:
    /// - accessToken: Short-lived JWT (60 min default)
    /// - refreshToken: Long-lived refresh token
    /// - expiresIn: Token expiration in seconds
    /// - user: User information (ID, email, role, organization)
    /// </returns>
    /// <response code="200">Login successful</response>
    /// <response code="401">Invalid credentials or inactive account</response>
    /// <response code="429">Rate limit exceeded (10 req/min)</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Registers a new user (SystemOwner only).
    /// </summary>
    /// <param name="request">Registration details (email, password, name, role)</param>
    /// <returns>The newly created user information</returns>
    /// <response code="201">User created successfully</response>
    /// <response code="400">Invalid data or email already in use</response>
    /// <response code="401">Unauthorized (not a SystemOwner)</response>
    [HttpPost("register")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var user = await _authService.RegisterAsync(request);
            return CreatedAtAction(nameof(Register), user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Refreshes an expired access token using a refresh token.
    /// </summary>
    /// <param name="request">The refresh token request</param>
    /// <returns>A new access token</returns>
    /// <response code="200">Token refreshed successfully</response>
    /// <response code="401">Invalid or expired refresh token</response>
    /// <response code="429">Rate limit exceeded (10 req/min)</response>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<RefreshTokenResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Logs out the current user, revoking all their refresh tokens.
    /// </summary>
    /// <returns>No content (success indicator)</returns>
    /// <response code="204">Logout successful</response>
    /// <response code="401">User not authenticated</response>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userIdClaim = User.FindFirst("userId");
        if (!int.TryParse(userIdClaim?.Value, out var userId))
            return Unauthorized();

        await _authService.LogoutAsync(userId);
        return NoContent();
    }
}
