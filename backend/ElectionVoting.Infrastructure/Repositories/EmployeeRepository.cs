using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Employee>> GetByOrganizationAsync(int organizationId) =>
        await _context.Employees
            .Where(e => e.OrganizationId == organizationId)
            .ToListAsync();

    public async Task<Employee?> GetWithOrganizationAsync(int employeeId) =>
        await _context.Employees
            .Include(e => e.Organization)
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);

    public async Task<bool> EmailExistsInOrgAsync(string email, int organizationId) =>
        await _context.Employees
            .AnyAsync(e => e.Email == email.ToLowerInvariant() && e.OrganizationId == organizationId);
}
