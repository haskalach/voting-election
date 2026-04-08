using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

/// <summary>
/// Manages organization CRUD operations and administrative tasks.
/// Supports SystemOwner (full access) and Manager (own organization only).
/// All endpoints require JWT authentication via Bearer token.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _orgService;

    /// <summary>Initializes the organizations controller with service dependency</summary>
    /// <param name="orgService">Service managing organization CRUD operations</param>
    public OrganizationsController(IOrganizationService orgService) => _orgService = orgService;

    /// <summary>Retrieves all organizations (visible to SystemOwner and Managers)</summary>
    /// <returns>List of organizations with summary details (ID, name, status)</returns>
    /// <response code="200">Successfully retrieved organizations</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User role not authorized to view organizations</response>
    [HttpGet]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<ActionResult<IEnumerable<OrganizationSummaryDto>>> GetAll() =>
        Ok(await _orgService.GetAllAsync());

    /// <summary>Retrieves a specific organization by ID with full details</summary>
    /// <param name="id">The organization ID</param>
    /// <returns>Complete organization details including employees, manager info</returns>
    /// <response code="200">Organization found and returned</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User role not authorized</response>
    /// <response code="404">Organization not found</response>
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

    /// <summary>Creates a new organization with initial manager and settings (SystemOwner only)</summary>
    /// <param name="dto">Organization creation details (name, initial manager credentials, admin info)</param>
    /// <returns>Newly created organization with assigned ID</returns>
    /// <response code="201">Organization created successfully</response>
    /// <response code="400">Invalid organization data or duplicate name</response>
    /// <response code="401">User not authenticated or unauthorized</response>
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

    /// <summary>Updates organization details (SystemOwner all orgs, Manager your own)</summary>
    /// <param name="id">The organization ID to update</param>
    /// <param name="dto">Updated organization information</param>
    /// <returns>Updated organization details</returns>
    /// <response code="200">Organization updated successfully</response>
    /// <response code="400">Invalid update data</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">Manager attempting to update different organization</response>
    /// <response code="404">Organization not found</response>
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

    /// <summary>Deletes an organization and all associated employees/users (SystemOwner only)</summary>
    /// <param name="id">The organization ID to delete</param>
    /// <response code="204">Organization deleted successfully</response>
    /// <response code="401">User not authenticated or unauthorized</response>
    /// <response code="404">Organization not found</response>
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
