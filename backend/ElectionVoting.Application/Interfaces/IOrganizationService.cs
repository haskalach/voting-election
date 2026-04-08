using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

/// <summary>
/// Manages organization CRUD operations, employee assignments, and organizational hierarchy.
/// Enforces data integrity through cascading deletes and manages user lifecycle with organizations.
/// </summary>
public interface IOrganizationService
{
    /// <summary>Retrieves all organizations with summary information</summary>
    /// <returns>List of organizations with counts and status</returns>
    Task<IEnumerable<OrganizationSummaryDto>> GetAllAsync();

    /// <summary>Retrieves a specific organization with full details and employee count</summary>
    /// <param name="id">Organization ID</param>
    /// <returns>Complete organization details</returns>
    /// <exception cref="KeyNotFoundException">Organization not found</exception>
    Task<OrganizationDto> GetByIdAsync(int id);

    /// <summary>Creates new organization with initial manager and default settings</summary>
    /// <param name="dto">Organization creation data (name, manager credentials)</param>
    /// <param name="createdByUserId">ID of user creating the organization</param>
    /// <returns>Newly created organization with assigned ID</returns>
    /// <exception cref="InvalidOperationException">Duplicate organization name or invalid data</exception>
    Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto, int createdByUserId);

    /// <summary>Updates organization settings and information</summary>
    /// <param name="id">Organization ID to update</param>
    /// <param name="dto">Updated organization data</param>
    /// <returns>Updated organization details with refreshed employee count</returns>
    /// <exception cref="KeyNotFoundException">Organization not found</exception>
    Task<OrganizationDto> UpdateAsync(int id, UpdateOrganizationDto dto);

    /// <summary>Deletes organization and cascades deletion to all employees and associated users</summary>
    /// <param name="id">Organization ID to delete</param>
    /// <remarks>Performs cascade delete: Organization → Employees → Users to maintain referential integrity</remarks>
    /// <exception cref="KeyNotFoundException">Organization not found</exception>
    Task DeleteAsync(int id);
}
