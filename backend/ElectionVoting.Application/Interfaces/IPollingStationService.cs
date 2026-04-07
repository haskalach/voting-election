using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

public interface IPollingStationService
{
    Task<IEnumerable<PollingStationDto>> GetByOrganizationAsync(int organizationId);
    Task<PollingStationDto> GetByIdAsync(int id);
    Task<PollingStationDto> CreateAsync(int organizationId, CreatePollingStationDto dto);
    Task DeleteAsync(int id);
}
