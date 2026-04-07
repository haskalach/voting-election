using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IRoleRepository : IRepository<Role>
{
    Task<Role?> GetByNameAsync(string roleName);
}
