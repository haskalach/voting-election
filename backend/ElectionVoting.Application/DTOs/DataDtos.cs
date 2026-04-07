namespace ElectionVoting.Application.DTOs;

public record LogVoterAttendanceDto(
    int PollingStationId,
    int VoterCount,
    string Notes);

public record VoterAttendanceDto(
    int AttendanceId,
    int EmployeeId,
    string EmployeeName,
    int PollingStationId,
    string StationName,
    int VoterCount,
    string Notes,
    bool IsVerified,
    DateTime RecordedAt);

public record LogVoteCountDto(
    int PollingStationId,
    string CandidateName,
    int Votes);

public record VoteCountDto(
    int VoteCountId,
    int EmployeeId,
    string EmployeeName,
    int PollingStationId,
    string StationName,
    string CandidateName,
    int Votes,
    bool IsVerified,
    DateTime RecordedAt);
