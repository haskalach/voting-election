using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class RefreshTokenRepository : Repository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(AppDbContext context) : base(context) { }

    public async Task<RefreshToken?> GetValidTokenAsync(string token) =>
        await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow);

    public async Task RevokeAllUserTokensAsync(int userId)
    {
        var tokens = _context.RefreshTokens.Where(rt => rt.UserId == userId && !rt.IsRevoked);
        await tokens.ForEachAsync(rt => rt.IsRevoked = true);
    }
}
