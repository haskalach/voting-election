using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IOrganizationRepository : IRepository<Organization>
{
    Task<IEnumerable<Organization>> GetByOwnerAsync(int userId);
    Task<Organization?> GetWithEmployeesAsync(int organizationId);
    Task<bool> NameExistsAsync(string name);
}
