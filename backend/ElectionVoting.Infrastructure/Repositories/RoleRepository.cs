using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class RoleRepository : Repository<Role>, IRoleRepository
{
    private new readonly AppDbContext _context;

    public RoleRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Role?> GetByNameAsync(string roleName)
    {
        return await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
    }
}
