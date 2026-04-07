using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<RefreshTokenResponseDto> RefreshTokenAsync(string refreshToken);
    Task<UserDto> RegisterAsync(RegisterRequestDto request);
    Task LogoutAsync(int userId);
}
