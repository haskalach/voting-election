using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetOrganizationDashboardAsync(int organizationId);
    Task<DashboardDto> GetSystemDashboardAsync();
}
