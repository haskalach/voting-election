using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IVoteCountRepository : IRepository<VoteCount>
{
    Task<IEnumerable<VoteCount>> GetByEmployeeAsync(int employeeId);
    Task<IEnumerable<VoteCount>> GetByOrganizationAsync(int organizationId);
    Task<IEnumerable<VoteCount>> GetByStationAsync(int pollingStationId);
}
