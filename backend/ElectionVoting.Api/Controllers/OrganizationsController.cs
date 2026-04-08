using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _orgService;

    public OrganizationsController(IOrganizationService orgService) => _orgService = orgService;

    [HttpGet]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<ActionResult<IEnumerable<OrganizationSummaryDto>>> GetAll() =>
        Ok(await _orgService.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<ActionResult<OrganizationDto>> GetById(int id)
    {
        try
        {
            return Ok(await _orgService.GetByIdAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<OrganizationDto>> Create([FromBody] CreateOrganizationDto dto)
    {
        var userIdClaim = User.FindFirst("userId");
        if (!int.TryParse(userIdClaim?.Value, out var userId))
            return Unauthorized();

        try
        {
            var org = await _orgService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = org.OrganizationId }, org);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<ActionResult<OrganizationDto>> Update(int id, [FromBody] UpdateOrganizationDto dto)
    {
        // Managers can only update their own organization
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == "Manager")
        {
            var orgIdClaim = User.FindFirst("organizationId")?.Value;
            if (!int.TryParse(orgIdClaim, out var userOrgId) || userOrgId != id)
                return Forbid();
        }
        try
        {
            return Ok(await _orgService.UpdateAsync(id, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _orgService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
