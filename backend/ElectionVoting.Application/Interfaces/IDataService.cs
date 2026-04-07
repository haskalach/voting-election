using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

public interface IDataService
{
    Task<VoterAttendanceDto> LogAttendanceAsync(int employeeId, LogVoterAttendanceDto dto);
    Task<IEnumerable<VoterAttendanceDto>> GetAttendanceByEmployeeAsync(int employeeId);
    Task<IEnumerable<VoterAttendanceDto>> GetAttendanceByOrganizationAsync(int organizationId);
    Task<VoteCountDto> LogVoteCountAsync(int employeeId, LogVoteCountDto dto);
    Task<IEnumerable<VoteCountDto>> GetVoteCountsByEmployeeAsync(int employeeId);
    Task<IEnumerable<VoteCountDto>> GetVoteCountsByOrganizationAsync(int organizationId);
}
