using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

/// <summary>
/// Provides analytics and reporting for elections and voting activities.
/// Supports organization-level and system-wide dashboard data including voter statistics,
/// participation rates, and election flow metrics.
/// </summary>
public interface IDashboardService
{
    /// <summary>Retrieves organization-specific dashboard with voter stats and election metrics</summary>
    /// <param name="organizationId">Organization ID to get dashboard for</param>
    /// <returns>Dashboard with voter counts, participation rates, polling station metrics</returns>
    /// <remarks>Returns only data for the specified organization; used by Managers and Employees</remarks>
    Task<DashboardDto> GetOrganizationDashboardAsync(int organizationId);

    /// <summary>Retrieves system-wide dashboard with aggregated metrics across all organizations</summary>
    /// <returns>System dashboard with total voters, participation rates by org, system health metrics</returns>
    /// <remarks>SystemOwner only; provides cross-organization analytics</remarks>
    Task<DashboardDto> GetSystemDashboardAsync();
}
