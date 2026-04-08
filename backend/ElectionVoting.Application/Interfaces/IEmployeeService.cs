using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

/// <summary>
/// Manages employee records within organizations including role assignments and lifecycle management.
/// Handles both active employment and deactivation workflows with associated user account management.
/// </summary>
public interface IEmployeeService
{
    /// <summary>Retrieves all active employees for an organization</summary>
    /// <param name="organizationId">Organization ID to fetch employees for</param>
    /// <returns>List of employees with summary information (name, role, status)</returns>
    Task<IEnumerable<EmployeeSummaryDto>> GetByOrganizationAsync(int organizationId);

    /// <summary>Retrieves a specific employee with complete details</summary>
    /// <param name="employeeId">Employee ID</param>
    /// <returns>Full employee record including role and organizational context</returns>
    /// <exception cref="KeyNotFoundException">Employee not found</exception>
    Task<EmployeeDto> GetByIdAsync(int employeeId);

    /// <summary>Creates a new employee and associated user account in the organization</summary>
    /// <param name="organizationId">Organization ID to add employee to</param>
    /// <param name="dto">Employee creation data (name, email, role)</param>
    /// <param name="supervisedByUserId">ID of user creating the employee (audit trail)</param>
    /// <returns>Newly created employee with assigned ID and linked user</returns>
    /// <exception cref="InvalidOperationException">Duplicate email or invalid organization</exception>
    Task<EmployeeDto> CreateAsync(int organizationId, CreateEmployeeDto dto, int supervisedByUserId);

    /// <summary>Updates employee information (name, role, contact details)</summary>
    /// <param name="employeeId">Employee ID to update</param>
    /// <param name="dto">Updated employee data</param>
    /// <returns>Updated employee details</returns>
    /// <exception cref="KeyNotFoundException">Employee not found</exception>
    Task<EmployeeDto> UpdateAsync(int employeeId, UpdateEmployeeDto dto);

    /// <summary>Deactivates an employee without deleting data (soft delete)</summary>
    /// <param name="employeeId">Employee ID to deactivate</param>
    /// <remarks>Keeps employee records for audit history; user account may be disabled</remarks>
    /// <exception cref="KeyNotFoundException">Employee not found</exception>
    Task DeactivateAsync(int employeeId);

    /// <summary>Permanently deletes an employee and associated user account (hard delete)</summary>
    /// <param name="employeeId">Employee ID to delete</param>
    /// <remarks>Removes employee and cascades to user deletion; triggers audit logging</remarks>
    /// <exception cref="KeyNotFoundException">Employee not found</exception>
    Task DeleteAsync(int employeeId);
}
