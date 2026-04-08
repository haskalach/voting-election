using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/organizations/{orgId}/employees")]
[Authorize(Roles = "SystemOwner,Manager")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _empService;

    public EmployeesController(IEmployeeService empService) => _empService = empService;

    private bool IsOrgAccessAllowed(int orgId)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == "Manager")
        {
            var orgIdClaim = User.FindFirst("organizationId")?.Value;
            if (!int.TryParse(orgIdClaim, out var userOrgId) || userOrgId != orgId)
                return false;
        }
        return true;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeSummaryDto>>> GetByOrganization(int orgId)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        return Ok(await _empService.GetByOrganizationAsync(orgId));
    }

    [HttpGet("{empId}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int orgId, int empId)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        try
        {
            return Ok(await _empService.GetByIdAsync(empId));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(int orgId, [FromBody] CreateEmployeeDto dto)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();

        var userIdClaim = User.FindFirst("userId");
        if (!int.TryParse(userIdClaim?.Value, out var userId))
            return Unauthorized();

        try
        {
            var emp = await _empService.CreateAsync(orgId, dto, userId);
            return CreatedAtAction(nameof(GetById), new { orgId, empId = emp.EmployeeId }, emp);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{empId}")]
    public async Task<ActionResult<EmployeeDto>> Update(int orgId, int empId, [FromBody] UpdateEmployeeDto dto)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        try
        {
            return Ok(await _empService.UpdateAsync(empId, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{empId}")]
    public async Task<IActionResult> Delete(int orgId, int empId)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        try
        {
            await _empService.DeleteAsync(empId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
