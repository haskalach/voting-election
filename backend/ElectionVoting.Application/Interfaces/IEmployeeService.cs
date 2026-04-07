using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Application.Interfaces;

public interface IEmployeeService
{
    Task<IEnumerable<EmployeeSummaryDto>> GetByOrganizationAsync(int organizationId);
    Task<EmployeeDto> GetByIdAsync(int employeeId);
    Task<EmployeeDto> CreateAsync(int organizationId, CreateEmployeeDto dto, int supervisedByUserId);
    Task<EmployeeDto> UpdateAsync(int employeeId, UpdateEmployeeDto dto);
    Task DeactivateAsync(int employeeId);
    Task DeleteAsync(int employeeId);
}
