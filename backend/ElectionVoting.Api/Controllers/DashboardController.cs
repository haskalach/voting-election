using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashService;

    public DashboardController(IDashboardService dashService) => _dashService = dashService;

    [HttpGet("organization/{orgId}")]
    [Authorize(Roles = "SystemOwner,Manager")]
    public async Task<ActionResult<DashboardDto>> GetOrganizationDashboard(int orgId)
    {
        // Managers can only view their own organization's dashboard
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == "Manager")
        {
            var orgIdClaim = User.FindFirst("organizationId")?.Value;
            if (!int.TryParse(orgIdClaim, out var userOrgId) || userOrgId != orgId)
                return Forbid();
        }
        return Ok(await _dashService.GetOrganizationDashboardAsync(orgId));
    }

    [HttpGet("system")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<DashboardDto>> GetSystemDashboard() =>
        Ok(await _dashService.GetSystemDashboardAsync());
}
