using System.ComponentModel.DataAnnotations;

namespace ElectionVoting.Application.DTOs;

public record LogVoterAttendanceDto(
    [Range(1, int.MaxValue)] int PollingStationId,
    [Range(0, int.MaxValue)] int VoterCount,
    [MaxLength(500)] string? Notes);

public record VoterAttendanceDto(
    int AttendanceId,
    int EmployeeId,
    string EmployeeName,
    int PollingStationId,
    string StationName,
    int VoterCount,
    string? Notes,
    bool IsVerified,
    DateTime RecordedAt);

public record LogVoteCountDto(
    [Range(1, int.MaxValue)] int PollingStationId,
    [Required][MaxLength(200)] string CandidateName,
    [Range(0, int.MaxValue)] int Votes);

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
