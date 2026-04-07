using ElectionVoting.Domain.Entities;

namespace ElectionVoting.Domain.Interfaces;

public interface IPollingStationRepository : IRepository<PollingStation>
{
    Task<IEnumerable<PollingStation>> GetByOrganizationAsync(int organizationId);
}
