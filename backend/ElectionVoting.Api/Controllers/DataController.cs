using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectionVoting.Api.Controllers;

/// <summary>
/// Records and retrieves voter participation and vote count data on election day.
/// Employees log voter attendance and final vote tallies; aggregated for results reporting.
/// </summary>
[ApiController]
[Route("api/data")]
[Authorize]
public class DataController : ControllerBase
{
    private readonly IDataService _dataService;

    /// <summary>Initializes the data controller with data service dependency</summary>
    /// <param name="dataService">Service for managing election day operational data</param>
    public DataController(IDataService dataService) => _dataService = dataService;

    /// <summary>Logs a voter arrival at the polling station (Employee only)</summary>
    /// <param name="dto">Voter attendance record (voter ID, station, timestamp)</param>
    /// <returns>Recorded attendance entry with confirmation</returns>
    /// <response code="201">Attendance logged successfully</response>
    /// <response code="400">Invalid attendance data or duplicate voter</response>
    /// <response code="401">User not authenticated or employee claim missing</response>
    [HttpPost("attendance")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<VoterAttendanceDto>> LogAttendance([FromBody] LogVoterAttendanceDto dto)
    {
        var empIdClaim = User.FindFirst("employeeId");
        if (!int.TryParse(empIdClaim?.Value, out var empId))
            return Unauthorized();

        try
        {
            var record = await _dataService.LogAttendanceAsync(empId, dto);
            return CreatedAtAction(nameof(LogAttendance), record);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Logs final vote count tally for an election (Employee only)</summary>
    /// <param name="dto">Vote count data (candidate totals, polling station, timestamp)</param>
    /// <returns>Recorded vote count with confirmation</returns>
    /// <response code="201">Vote count logged successfully</response>
    /// <response code="400">Invalid vote count data</response>
    /// <response code="401">User not authenticated or employee claim missing</response>
    [HttpPost("votes")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<VoteCountDto>> LogVoteCount([FromBody] LogVoteCountDto dto)
    {
        var empIdClaim = User.FindFirst("employeeId");
        if (!int.TryParse(empIdClaim?.Value, out var empId))
            return Unauthorized();

        try
        {
            var record = await _dataService.LogVoteCountAsync(empId, dto);
            return CreatedAtAction(nameof(LogVoteCount), record);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Retrieves voter attendance records for the current employee</summary>
    /// <returns>List of voters processed by this employee</returns>
    /// <response code="200">Attendance records retrieved</response>
    /// <response code="401">User not authenticated or employee claim missing</response>
    [HttpGet("attendance/employee")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<IEnumerable<VoterAttendanceDto>>> GetMyAttendance()
    {
        var empIdClaim = User.FindFirst("employeeId");
        if (!int.TryParse(empIdClaim?.Value, out var empId))
            return Unauthorized();

        return Ok(await _dataService.GetAttendanceByEmployeeAsync(empId));
    }

    /// <summary>Retrieves vote count records submitted by the current employee</summary>
    /// <returns>List of vote tallies submitted by this employee</returns>
    /// <response code="200">Vote count records retrieved</response>
    /// <response code="401">User not authenticated or employee claim missing</response>
    [HttpGet("votes/employee")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<IEnumerable<VoteCountDto>>> GetMyVotes()
    {
        var empIdClaim = User.FindFirst("employeeId");
        if (!int.TryParse(empIdClaim?.Value, out var empId))
            return Unauthorized();

        return Ok(await _dataService.GetVoteCountsByEmployeeAsync(empId));
    }
}
