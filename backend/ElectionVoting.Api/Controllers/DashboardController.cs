using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectionVoting.Api.Controllers;

/// <summary>
/// Provides dashboard and analytics endpoints for monitoring election data.
/// </summary>
/// <remarks>
/// Provides role-based dashboard data:
/// - SystemOwner: System-wide statistics and organization summaries
/// - Manager: Organization-specific metrics (employees, attendance, votes)
/// 
/// All endpoints require authentication.
/// </remarks>
[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashService;

    /// <summary>
    /// Initializes a new instance of the DashboardController.
    /// </summary>
    /// <param name="dashService">The dashboard service dependency</param>
    public DashboardController(IDashboardService dashService) => _dashService = dashService;

    /// <summary>
    /// Gets organization-specific dashboard metrics (Managers only).
    /// </summary>
    /// <remarks>
    /// Managers can only access their own organization's dashboard.
    /// Attempting to access another organization returns 403 Forbidden.
    /// </remarks>
    /// <param name="orgId">The organization ID</param>
    /// <returns>Organization dashboard with metrics (employees, attendance, votes)</returns>
    /// <response code="200">Dashboard data retrieved successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">Manager does not belong to this organization</response>
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

    /// <summary>
    /// Gets system-wide dashboard aggregating all organizations (SystemOwner only).
    /// </summary>
    /// <remarks>
    /// Returns comprehensive metrics across the entire election system,
    /// including total employees, attendance, votes across all organizations.
    /// </remarks>
    /// <returns>System-wide dashboard with aggregated metrics</returns>
    /// <response code="200">System dashboard retrieved successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">User is not a SystemOwner</response>
    [HttpGet("system")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<DashboardDto>> GetSystemDashboard() =>
        Ok(await _dashService.GetSystemDashboardAsync());
}
