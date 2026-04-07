using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ActionResult<DashboardDto>> GetOrganizationDashboard(int orgId) =>
        Ok(await _dashService.GetOrganizationDashboardAsync(orgId));

    [HttpGet("system")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<DashboardDto>> GetSystemDashboard() =>
        Ok(await _dashService.GetSystemDashboardAsync());
}
