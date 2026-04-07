using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class OrganizationRepository : Repository<Organization>, IOrganizationRepository
{
    public OrganizationRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Organization>> GetByOwnerAsync(int userId) =>
        await _context.Organizations
            .Where(o => o.CreatedByUserId == userId)
            .Include(o => o.Employees)
            .ToListAsync();

    public async Task<Organization?> GetWithEmployeesAsync(int organizationId) =>
        await _context.Organizations
            .Include(o => o.Employees)
            .FirstOrDefaultAsync(o => o.OrganizationId == organizationId);

    public async Task<bool> NameExistsAsync(string name) =>
        await _context.Organizations.AnyAsync(o => o.OrganizationName == name);
}
