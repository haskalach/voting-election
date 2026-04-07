using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

public interface IOrganizationService
{
    Task<IEnumerable<OrganizationSummaryDto>> GetAllAsync();
    Task<OrganizationDto> GetByIdAsync(int id);
    Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto, int createdByUserId);
    Task<OrganizationDto> UpdateAsync(int id, UpdateOrganizationDto dto);
    Task DeleteAsync(int id);
}
