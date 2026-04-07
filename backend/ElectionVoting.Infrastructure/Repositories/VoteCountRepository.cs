using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Repositories;

public class VoteCountRepository : Repository<VoteCount>, IVoteCountRepository
{
    public VoteCountRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<VoteCount>> GetByEmployeeAsync(int employeeId) =>
        await _context.VoteCounts
            .Where(vc => vc.EmployeeId == employeeId)
            .Include(vc => vc.Employee)
            .Include(vc => vc.PollingStation)
            .ToListAsync();

    public async Task<IEnumerable<VoteCount>> GetByOrganizationAsync(int organizationId) =>
        await _context.VoteCounts
            .Where(vc => vc.PollingStation.OrganizationId == organizationId)
            .Include(vc => vc.Employee)
            .Include(vc => vc.PollingStation)
            .ToListAsync();

    public async Task<IEnumerable<VoteCount>> GetByStationAsync(int pollingStationId) =>
        await _context.VoteCounts
            .Where(vc => vc.PollingStationId == pollingStationId)
            .Include(vc => vc.Employee)
            .ToListAsync();

    public async Task<bool> ExistsForCandidateOnDateAsync(int employeeId, int pollingStationId, string candidateName, DateTime date) =>
        await _context.VoteCounts.AnyAsync(vc =>
            vc.EmployeeId == employeeId &&
            vc.PollingStationId == pollingStationId &&
            vc.CandidateName.ToLower() == candidateName.ToLower() &&
            vc.RecordedAt.Date == date.Date);
}
