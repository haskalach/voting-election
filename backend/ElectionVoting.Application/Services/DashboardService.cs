using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Domain.Interfaces;

namespace ElectionVoting.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IOrganizationRepository _orgRepo;
    private readonly IVoterAttendanceRepository _attendanceRepo;
    private readonly IVoteCountRepository _voteCountRepo;
    private readonly IPollingStationRepository _stationRepo;
    private readonly IEmployeeRepository _employeeRepo;

    public DashboardService(
        IOrganizationRepository orgRepo,
        IVoterAttendanceRepository attendanceRepo,
        IVoteCountRepository voteCountRepo,
        IPollingStationRepository stationRepo,
        IEmployeeRepository employeeRepo)
    {
        _orgRepo = orgRepo;
        _attendanceRepo = attendanceRepo;
        _voteCountRepo = voteCountRepo;
        _stationRepo = stationRepo;
        _employeeRepo = employeeRepo;
    }

    public async Task<DashboardDto> GetOrganizationDashboardAsync(int organizationId)
    {
        var employees = await _employeeRepo.GetByOrganizationAsync(organizationId);
        var stations = await _stationRepo.GetByOrganizationAsync(organizationId);
        var attendance = await _attendanceRepo.GetByOrganizationAsync(organizationId);
        var voteCounts = await _voteCountRepo.GetByOrganizationAsync(organizationId);

        var employeeList = employees.ToList();
        var stationList = stations.ToList();
        var attendanceList = attendance.ToList();
        var voteList = voteCounts.ToList();

        long totalVoters = attendanceList.Sum(a => (long)a.VoterCount);
        long totalVotes = voteList.Sum(v => (long)v.Votes);

        var stationSummaries = stationList.Select(s => new StationSummaryDto(
            s.PollingStationId,
            s.StationName,
            attendanceList.Where(a => a.PollingStationId == s.PollingStationId).Sum(a => (long)a.VoterCount),
            voteList.Where(v => v.PollingStationId == s.PollingStationId).Sum(v => (long)v.Votes)));

        var candidateTallies = voteList
            .GroupBy(v => v.CandidateName)
            .Select(g => new CandidateTallyDto(
                g.Key,
                g.Sum(v => (long)v.Votes),
                totalVotes > 0 ? Math.Round(g.Sum(v => (double)v.Votes) / totalVotes * 100, 2) : 0));

        return new DashboardDto(
            employeeList.Count,
            employeeList.Count(e => e.IsActive),
            totalVoters,
            totalVotes,
            stationList.Count,
            stationSummaries,
            candidateTallies);
    }

    public async Task<DashboardDto> GetSystemDashboardAsync()
    {
        var orgs = await _orgRepo.GetAllAsync();
        var orgIds = orgs.Select(o => o.OrganizationId).ToList();

        long totalVoters = 0;
        long totalVotes = 0;
        int totalEmployees = 0;
        int activeEmployees = 0;
        int totalStations = 0;
        var allCandidateTallies = new Dictionary<string, long>();

        foreach (var orgId in orgIds)
        {
            var employees = (await _employeeRepo.GetByOrganizationAsync(orgId)).ToList();
            totalEmployees += employees.Count;
            activeEmployees += employees.Count(e => e.IsActive);
            totalStations += (await _stationRepo.GetByOrganizationAsync(orgId)).Count();
            totalVoters += (await _attendanceRepo.GetByOrganizationAsync(orgId)).Sum(a => (long)a.VoterCount);

            foreach (var vote in await _voteCountRepo.GetByOrganizationAsync(orgId))
            {
                totalVotes += vote.Votes;
                allCandidateTallies.TryAdd(vote.CandidateName, 0);
                allCandidateTallies[vote.CandidateName] += vote.Votes;
            }
        }

        var candidateTallies = allCandidateTallies.Select(kv => new CandidateTallyDto(
            kv.Key,
            kv.Value,
            totalVotes > 0 ? Math.Round((double)kv.Value / totalVotes * 100, 2) : 0));

        return new DashboardDto(
            totalEmployees,
            activeEmployees,
            totalVoters,
            totalVotes,
            totalStations,
            Enumerable.Empty<StationSummaryDto>(),
            candidateTallies);
    }
}
