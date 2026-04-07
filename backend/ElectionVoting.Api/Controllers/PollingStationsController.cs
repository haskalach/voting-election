using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/organizations/{orgId}/polling-stations")]
[Authorize]
public class PollingStationsController : ControllerBase
{
    private readonly IPollingStationService _stationService;

    public PollingStationsController(IPollingStationService stationService) => _stationService = stationService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PollingStationDto>>> GetByOrganization(int orgId) =>
        Ok(await _stationService.GetByOrganizationAsync(orgId));

    [HttpGet("{id}")]
    public async Task<ActionResult<PollingStationDto>> GetById(int orgId, int id)
    {
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<IActionResult> Delete(int orgId, int id)
    {
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
