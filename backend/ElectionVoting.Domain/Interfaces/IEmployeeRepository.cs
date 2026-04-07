using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IEmployeeRepository : IRepository<Employee>
{
    Task<IEnumerable<Employee>> GetByOrganizationAsync(int organizationId);
    Task<Employee?> GetWithOrganizationAsync(int employeeId);
    Task<bool> EmailExistsInOrgAsync(string email, int organizationId);
}
