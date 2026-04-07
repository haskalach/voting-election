using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class PollingStationRepository : Repository<PollingStation>, IPollingStationRepository
{
    public PollingStationRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<PollingStation>> GetByOrganizationAsync(int organizationId) =>
        await _context.PollingStations
            .Where(ps => ps.OrganizationId == organizationId)
            .ToListAsync();
}
