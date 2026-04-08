using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/organizations/{orgId}/polling-stations")]
[Authorize(Roles = "SystemOwner,Manager,Employee")]
public class PollingStationsController : ControllerBase
{
    private readonly IPollingStationService _stationService;

    public PollingStationsController(IPollingStationService stationService) => _stationService = stationService;

    private bool IsOrgAccessAllowed(int orgId)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == "Manager" || userRole == "Employee")
        {
            var orgIdClaim = User.FindFirst("organizationId")?.Value;
            if (!int.TryParse(orgIdClaim, out var userOrgId) || userOrgId != orgId)
                return false;
        }
        return true;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PollingStationDto>>> GetByOrganization(int orgId)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        return Ok(await _stationService.GetByOrganizationAsync(orgId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PollingStationDto>> GetById(int orgId, int id)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        try
        {
            return Ok(await _stationService.GetByIdAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<ActionResult<PollingStationDto>> Create(int orgId, [FromBody] CreatePollingStationDto dto)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        try
        {
            var station = await _stationService.CreateAsync(orgId, dto);
            return CreatedAtAction(nameof(GetById), new { orgId, id = station.PollingStationId }, station);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<ActionResult<PollingStationDto>> Update(int orgId, int id, [FromBody] UpdatePollingStationDto dto)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        try
        {
            return Ok(await _stationService.UpdateAsync(id, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<IActionResult> Delete(int orgId, int id)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        try
        {
            await _stationService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
