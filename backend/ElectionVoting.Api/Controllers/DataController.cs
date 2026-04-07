using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/data")]
[Authorize]
public class DataController : ControllerBase
{
    private readonly IDataService _dataService;

    public DataController(IDataService dataService) => _dataService = dataService;

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

    [HttpGet("attendance/employee")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<IEnumerable<VoterAttendanceDto>>> GetMyAttendance()
    {
        var empIdClaim = User.FindFirst("employeeId");
        if (!int.TryParse(empIdClaim?.Value, out var empId))
            return Unauthorized();

        return Ok(await _dataService.GetAttendanceByEmployeeAsync(empId));
    }

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
