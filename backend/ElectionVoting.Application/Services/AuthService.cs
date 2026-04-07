using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ElectionVoting.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IEmployeeRepository employeeRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _employeeRepository = employeeRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var accessToken = await GenerateAccessTokenAsync(user);
        var refreshToken = await CreateRefreshTokenAsync(user.UserId);
        var expiresIn = int.Parse(_configuration["Jwt:ExpiresInMinutes"] ?? "60") * 60;

        int? orgId = user.Role.RoleName == Role.Names.Manager
            ? user.Organizations.FirstOrDefault()?.OrganizationId
            : null;

        return new LoginResponseDto(
            accessToken,
            refreshToken.Token,
            expiresIn,
            new UserDto(user.UserId, user.Email, user.FirstName, user.LastName, user.Role.RoleName, orgId));
    }

    public async Task<RefreshTokenResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var token = await _refreshTokenRepository.GetValidTokenAsync(refreshToken)
            ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        token.IsRevoked = true;
        await _refreshTokenRepository.UpdateAsync(token);

        var user = await _userRepository.GetByIdWithRoleAsync(token.UserId)
            ?? throw new UnauthorizedAccessException("User not found.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        var newRefreshToken = await CreateRefreshTokenAsync(user.UserId);
        await _refreshTokenRepository.SaveChangesAsync();

        return new RefreshTokenResponseDto(await GenerateAccessTokenAsync(user));
    }

    public async Task<UserDto> RegisterAsync(RegisterRequestDto request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
            throw new InvalidOperationException("Email already in use.");

        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            RoleId = request.RoleId,
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var created = await _userRepository.GetByIdWithRoleAsync(user.UserId)!;
        return new UserDto(created!.UserId, created.Email, created.FirstName, created.LastName, created.Role.RoleName, null);
    }

    public async Task LogoutAsync(int userId)
    {
        await _refreshTokenRepository.RevokeAllUserTokensAsync(userId);
        await _refreshTokenRepository.SaveChangesAsync();
    }

    private async Task<string> GenerateAccessTokenAsync(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret not configured.")));

        // Get organization ID based on role
        string? organizationId = null;
        string? employeeId = null;

        if (user.Role.RoleName == Role.Names.Manager)
        {
            organizationId = user.Organizations.FirstOrDefault()?.OrganizationId.ToString();
        }
        else if (user.Role.RoleName == Role.Names.Employee)
        {
            var employee = await _employeeRepository.GetByUserIdAsync(user.UserId);
            if (employee != null)
            {
                organizationId = employee.OrganizationId.ToString();
                employeeId = employee.EmployeeId.ToString();
            }
        }

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.RoleName),
            new Claim("userId", user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Iss, _configuration["Jwt:Issuer"] ?? "election-api"),
            new Claim(JwtRegisteredClaimNames.Aud, _configuration["Jwt:Audience"] ?? "election-client"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrEmpty(organizationId))
            claims.Add(new Claim("organizationId", organizationId));

        if (!string.IsNullOrEmpty(employeeId))
            claims.Add(new Claim("employeeId", employeeId));

        var expiresMinutes = int.Parse(_configuration["Jwt:ExpiresInMinutes"] ?? "60");
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(int userId)
    {
        var token = new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        await _refreshTokenRepository.AddAsync(token);
        return token;
    }
}
