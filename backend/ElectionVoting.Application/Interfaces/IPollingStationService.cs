using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

/// <summary>
/// Manages polling station locations and election administration infrastructure.
/// Tracks station capacity, availability, and geographic distribution for voter access.
/// </summary>
public interface IPollingStationService
{
    /// <summary>Retrieves all active polling stations for an organization</summary>
    /// <param name="organizationId">Organization ID to fetch stations for</param>
    /// <returns>List of polling stations with location, capacity, and availability status</returns>
    Task<IEnumerable<PollingStationDto>> GetByOrganizationAsync(int organizationId);

    /// <summary>Retrieves a specific polling station with full details</summary>
    /// <param name="id">Polling station ID</param>
    /// <returns>Complete station information including capacity and equipment</returns>
    /// <exception cref="KeyNotFoundException">Station not found</exception>
    Task<PollingStationDto> GetByIdAsync(int id);

    /// <summary>Creates a new polling station in the organization</summary>
    /// <param name="organizationId">Organization ID to add station to</param>
    /// <param name="dto">Station creation data (name, location, voter capacity)</param>
    /// <returns>Newly created polling station with assigned ID</returns>
    /// <exception cref="InvalidOperationException">Duplicate location or invalid organization</exception>
    Task<PollingStationDto> CreateAsync(int organizationId, CreatePollingStationDto dto);

    /// <summary>Updates polling station information (capacity, location details)</summary>
    /// <param name="id">Polling station ID to update</param>
    /// <param name="dto">Updated station data</param>
    /// <returns>Updated polling station details</returns>
    /// <exception cref="KeyNotFoundException">Station not found</exception>
    Task<PollingStationDto> UpdateAsync(int id, UpdatePollingStationDto dto);

    /// <summary>Deletes a polling station (removes from election infrastructure)</summary>
    /// <param name="id">Polling station ID to delete</param>
    /// <remarks>Soft or hard delete depending on implementation; may cascade to attendance records</remarks>
    /// <exception cref="KeyNotFoundException">Station not found</exception>
    Task DeleteAsync(int id);
}
