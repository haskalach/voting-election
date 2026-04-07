using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email) =>
        await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Organizations)
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());

    public async Task<User?> GetByIdWithRoleAsync(int userId) =>
        await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Organizations)
            .FirstOrDefaultAsync(u => u.UserId == userId);

    public async Task<bool> EmailExistsAsync(string email) =>
        await _context.Users.AnyAsync(u => u.Email == email.ToLowerInvariant());
}
