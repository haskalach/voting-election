using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdWithRoleAsync(int userId);
    Task<bool> EmailExistsAsync(string email);
}
