using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/organizations/{orgId}/employees")]
[Authorize(Roles = "SystemOwner,Manager")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _empService;

    public EmployeesController(IEmployeeService empService) => _empService = empService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeSummaryDto>>> GetByOrganization(int orgId) =>
        Ok(await _empService.GetByOrganizationAsync(orgId));

    [HttpGet("{empId}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int orgId, int empId)
    {
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
    public async Task<IActionResult> Deactivate(int orgId, int empId)
    {
        try
        {
            await _empService.DeactivateAsync(empId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
