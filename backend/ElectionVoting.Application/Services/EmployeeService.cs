using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;

namespace ElectionVoting.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;

    public EmployeeService(IEmployeeRepository employeeRepository)
    {
        _employeeRepository = employeeRepository;
    }

    public async Task<IEnumerable<EmployeeSummaryDto>> GetByOrganizationAsync(int organizationId)
    {
        var employees = await _employeeRepository.GetByOrganizationAsync(organizationId);
        return employees.Select(e => new EmployeeSummaryDto(
            e.EmployeeId, e.FirstName, e.LastName, e.Email, e.IsActive));
    }

    public async Task<EmployeeDto> GetByIdAsync(int employeeId)
    {
        var emp = await _employeeRepository.GetWithOrganizationAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found.");
        return MapToDto(emp);
    }

    public async Task<EmployeeDto> CreateAsync(int organizationId, CreateEmployeeDto dto, int supervisedByUserId)
    {
        if (await _employeeRepository.EmailExistsInOrgAsync(dto.Email, organizationId))
            throw new InvalidOperationException("Employee with this email already exists in the organization.");

        var employee = new Employee
        {
            OrganizationId = organizationId,
            SupervisedByUserId = supervisedByUserId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email.ToLowerInvariant(),
            PhoneNumber = dto.PhoneNumber,
            DateOfBirth = dto.DateOfBirth
        };

        await _employeeRepository.AddAsync(employee);
        await _employeeRepository.SaveChangesAsync();
        return await GetByIdAsync(employee.EmployeeId);
    }

    public async Task<EmployeeDto> UpdateAsync(int employeeId, UpdateEmployeeDto dto)
    {
        var emp = await _employeeRepository.GetByIdAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found.");

        emp.FirstName = dto.FirstName;
        emp.LastName = dto.LastName;
        emp.Email = dto.Email.ToLowerInvariant();
        emp.PhoneNumber = dto.PhoneNumber;
        emp.DateOfBirth = dto.DateOfBirth;
        emp.IsActive = dto.IsActive;

        await _employeeRepository.UpdateAsync(emp);
        await _employeeRepository.SaveChangesAsync();
        return await GetByIdAsync(employeeId);
    }

    public async Task DeactivateAsync(int employeeId)
    {
        var emp = await _employeeRepository.GetByIdAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found.");
        emp.IsActive = false;
        await _employeeRepository.UpdateAsync(emp);
        await _employeeRepository.SaveChangesAsync();
    }

    public async Task DeleteAsync(int employeeId)
    {
        var emp = await _employeeRepository.GetByIdAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found.");
        await _employeeRepository.DeleteAsync(emp);
        await _employeeRepository.SaveChangesAsync();
    }

    private static EmployeeDto MapToDto(Employee e) => new(
        e.EmployeeId,
        e.OrganizationId,
        e.Organization?.OrganizationName ?? string.Empty,
        e.FirstName,
        e.LastName,
        e.Email,
        e.PhoneNumber,
        e.DateOfBirth,
        e.IsActive,
        e.CreatedAt,
        e.LastActivityAt);
}
