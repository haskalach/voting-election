using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

/// <summary>
/// Manages polling stations for election administration and voter access.
/// Employees can view stations; Managers and SystemOwner can modify.
/// All endpoints enforce organizational isolation for non-SystemOwner roles.
/// </summary>
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

    /// <summary>Retrieves all polling stations in an organization (Employees can view their org's stations)</summary>
    /// <param name="orgId">The organization ID</param>
    /// <returns>List of polling stations with location, capacity, and status</returns>
    /// <response code="200">Stations retrieved successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have access to this organization</response>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PollingStationDto>>> GetByOrganization(int orgId)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        return Ok(await _stationService.GetByOrganizationAsync(orgId));
    }

    /// <summary>Retrieves a specific polling station by ID</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="id">The polling station ID</param>
    /// <returns>Complete polling station details</returns>
    /// <response code="200">Station found and returned</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have access to this organization</response>
    /// <response code="404">Polling station not found</response>
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

    /// <summary>Creates a new polling station in the organization (Manager/SystemOwner only)</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="dto">Station details (name, location, voter capacity)</param>
    /// <returns>Newly created polling station with assigned ID</returns>
    /// <response code="201">Station created successfully</response>
    /// <response code="400">Invalid station data or duplicate location</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have permission to create stations</response>
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

    /// <summary>Updates polling station details (Manager/SystemOwner only)</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="id">The polling station ID to update</param>
    /// <param name="dto">Updated station information</param>
    /// <returns>Updated polling station details</returns>
    /// <response code="200">Station updated successfully</response>
    /// <response code="400">Invalid update data</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have permission or org access</response>
    /// <response code="404">Polling station not found</response>
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

    /// <summary>Deletes a polling station (Manager/SystemOwner only)</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="id">The polling station ID to delete</param>
    /// <response code="204">Station deleted successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have permission or org access</response>
    /// <response code="404">Polling station not found</response>
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
