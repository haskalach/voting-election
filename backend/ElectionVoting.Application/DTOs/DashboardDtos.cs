namespace ElectionVoting.Application.DTOs;

public record DashboardDto(
    int TotalEmployees,
    int ActiveEmployees,
    long TotalVotersLogged,
    long TotalVotesCounted,
    int TotalPollingStations,
    IEnumerable<StationSummaryDto> StationSummaries,
    IEnumerable<CandidateTallyDto> CandidateTallies);

public record StationSummaryDto(
    int PollingStationId,
    string StationName,
    long TotalVoters,
    long TotalVotes);

public record CandidateTallyDto(
    string CandidateName,
    long TotalVotes,
    double Percentage);

public record CreatePollingStationDto(
    string StationName,
    string Location,
    string Address,
    int Capacity);

public record PollingStationDto(
    int PollingStationId,
    int OrganizationId,
    string StationName,
    string Location,
    string Address,
    int Capacity,
    DateTime CreatedAt);
