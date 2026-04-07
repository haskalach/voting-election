using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class AuditLogRepository : Repository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<AuditLog>> GetByOrganizationAsync(int organizationId) =>
        await _context.AuditLogs
            .Where(a => a.OrganizationId == organizationId)
            .Include(a => a.User)
            .Include(a => a.Organization)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetByUserAsync(int userId) =>
        await _context.AuditLogs
            .Where(a => a.UserId == userId)
            .Include(a => a.User)
            .Include(a => a.Organization)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityType, int entityId) =>
        await _context.AuditLogs
            .Where(a => a.EntityType == entityType && a.EntityId == entityId)
            .Include(a => a.User)
            .Include(a => a.Organization)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetRecentAsync(int count) =>
        await _context.AuditLogs
            .Include(a => a.User)
            .Include(a => a.Organization)
            .OrderByDescending(a => a.Timestamp)
            .Take(count)
            .ToListAsync();
}
