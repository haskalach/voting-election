using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

/// <summary>
/// Records and retrieves election day operational data: voter attendance and vote counts.
/// Employees log voter arrivals and final vote tallies; managers analyze aggregate data.
/// Maintains data integrity with validation and audit trail logging.
/// </summary>
public interface IDataService
{
    /// <summary>Logs a voter attending a polling station</summary>
    /// <param name="employeeId">ID of employee logging the attendance</param>
    /// <param name="dto">Attendance data (voter ID, timestamp, station, notes)</param>
    /// <returns>Recorded attendance entry with timestamp confirmation</returns>
    /// <remarks>Creates audit entry; prevents duplicate voter records at same location</remarks>
    Task<VoterAttendanceDto> LogAttendanceAsync(int employeeId, LogVoterAttendanceDto dto);

    /// <summary>Retrieves all voter attendance records logged by an employee</summary>
    /// <param name="employeeId">Employee ID to get attendance records for</param>
    /// <returns>List of voters processed by this employee with timestamps</returns>
    Task<IEnumerable<VoterAttendanceDto>> GetAttendanceByEmployeeAsync(int employeeId);

    /// <summary>Retrieves all voter attendance records for an organization</summary>
    /// <param name="organizationId">Organization ID to get aggregate attendance for</param>
    /// <returns>Complete voter attendance roster with metrics for the organization</returns>
    /// <remarks>Used for dashboard analytics and final reporting</remarks>
    Task<IEnumerable<VoterAttendanceDto>> GetAttendanceByOrganizationAsync(int organizationId);

    /// <summary>Logs final vote count tally for an election</summary>
    /// <param name="employeeId">ID of employee recording the count</param>
    /// <param name="dto">Vote count data (total votes, candidate tallies, station, timestamp)</param>
    /// <returns>Recorded vote count entry</returns>
    /// <remarks>Creates audit entry; validates count against attendance records</remarks>
    Task<VoteCountDto> LogVoteCountAsync(int employeeId, LogVoteCountDto dto);

    /// <summary>Retrieves all vote count records logged by an employee</summary>
    /// <param name="employeeId">Employee ID to get vote counts for</param>
    /// <returns>List of vote count submissions with tallies</returns>
    Task<IEnumerable<VoteCountDto>> GetVoteCountsByEmployeeAsync(int employeeId);

    /// <summary>Retrieves all vote count records for an organization (election results)</summary>
    /// <param name="organizationId">Organization ID to get aggregate results for</param>
    /// <returns>Complete election results by station with final tallies</returns>
    /// <remarks>Used for election reporting and results publication</remarks>
    Task<IEnumerable<VoteCountDto>> GetVoteCountsByOrganizationAsync(int organizationId);
}
