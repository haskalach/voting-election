using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IAuditLogRepository : IRepository<AuditLog>
{
    Task<IEnumerable<AuditLog>> GetByOrganizationAsync(int organizationId);
    Task<IEnumerable<AuditLog>> GetByUserAsync(int userId);
    Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityType, int entityId);
    Task<IEnumerable<AuditLog>> GetRecentAsync(int count);
}
