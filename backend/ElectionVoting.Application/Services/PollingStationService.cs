using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;

namespace ElectionVoting.Application.Services;

public class PollingStationService : IPollingStationService
{
    private readonly IPollingStationRepository _stationRepo;

    public PollingStationService(IPollingStationRepository stationRepo)
    {
        _stationRepo = stationRepo;
    }

    public async Task<IEnumerable<PollingStationDto>> GetByOrganizationAsync(int organizationId)
    {
        var stations = await _stationRepo.GetByOrganizationAsync(organizationId);
        return stations.Select(MapToDto);
    }

    public async Task<PollingStationDto> GetByIdAsync(int id)
    {
        var station = await _stationRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Polling station {id} not found.");
        return MapToDto(station);
    }

    public async Task<PollingStationDto> CreateAsync(int organizationId, CreatePollingStationDto dto)
    {
        var station = new PollingStation
        {
            OrganizationId = organizationId,
            StationName = dto.StationName,
            Location = dto.Location,
            Address = dto.Address,
            Capacity = dto.Capacity
        };
        await _stationRepo.AddAsync(station);
        await _stationRepo.SaveChangesAsync();
        return MapToDto(station);
    }

    public async Task<PollingStationDto> UpdateAsync(int id, UpdatePollingStationDto dto)
    {
        var station = await _stationRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Polling station {id} not found.");
        station.StationName = dto.StationName;
        station.Location = dto.Location;
        station.Address = dto.Address;
        station.Capacity = dto.Capacity;
        await _stationRepo.SaveChangesAsync();
        return MapToDto(station);
    }

    public async Task DeleteAsync(int id)
    {
        var station = await _stationRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Polling station {id} not found.");
        await _stationRepo.DeleteAsync(station);
        await _stationRepo.SaveChangesAsync();
    }

    private static PollingStationDto MapToDto(PollingStation s) => new(
        s.PollingStationId,
        s.OrganizationId,
        s.StationName,
        s.Location,
        s.Address,
        s.Capacity,
        s.CreatedAt);
}
