using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

/// <summary>
/// Manages employees within organizations with role-based access control.
/// Managers can only access their own organization's employees.
/// All endpoints require JWT authentication and organizational isolation checks.
/// </summary>
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

    /// <summary>Retrieves all employees in an organization (requires org access)</summary>
    /// <param name="orgId">The organization ID</param>
    /// <returns>List of employees with summary information</returns>
    /// <response code="200">Employees retrieved successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have access to this organization</response>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeSummaryDto>>> GetByOrganization(int orgId)
    {
        if (!IsOrgAccessAllowed(orgId))
            return Forbid();
        return Ok(await _empService.GetByOrganizationAsync(orgId));
    }

    /// <summary>Retrieves a specific employee by ID with full details</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="empId">The employee ID</param>
    /// <returns>Complete employee information</returns>
    /// <response code="200">Employee found and returned</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have access to this organization</response>
    /// <response code="404">Employee not found</response>
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

    /// <summary>Creates a new employee in the organization</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="dto">Employee data (name, email, role assignment)</param>
    /// <returns>Newly created employee with assigned ID and user account</returns>
    /// <response code="201">Employee created successfully</response>
    /// <response code="400">Invalid employee data or duplicate email</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have access to this organization</response>
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

    /// <summary>Updates employee information</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="empId">The employee ID to update</param>
    /// <param name="dto">Updated employee data</param>
    /// <returns>Updated employee details</returns>
    /// <response code="200">Employee updated successfully</response>
    /// <response code="400">Invalid update data</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have access to this organization</response>
    /// <response code="404">Employee not found</response>
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

    /// <summary>Deletes an employee and associated user account</summary>
    /// <param name="orgId">The organization ID</param>
    /// <param name="empId">The employee ID to delete</param>
    /// <response code="204">Employee deleted successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User does not have access to this organization</response>
    /// <response code="404">Employee not found</response>
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
