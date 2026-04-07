using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using BCrypt.Net;

namespace ElectionVoting.Application.Services;

public class OrganizationService : IOrganizationService
{
    private readonly IOrganizationRepository _orgRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IRoleRepository _roleRepository;

    public OrganizationService(
        IOrganizationRepository orgRepository,
        IUserRepository userRepository,
        IEmployeeRepository employeeRepository,
        IRoleRepository roleRepository)
    {
        _orgRepository = orgRepository;
        _userRepository = userRepository;
        _employeeRepository = employeeRepository;
        _roleRepository = roleRepository;
    }

    public async Task<IEnumerable<OrganizationSummaryDto>> GetAllAsync()
    {
        var orgs = await _orgRepository.GetAllAsync();
        return orgs.Select(o => new OrganizationSummaryDto(
            o.OrganizationId,
            o.OrganizationName,
            o.PartyName,
            o.IsActive,
            o.Employees.Count));
    }

    public async Task<OrganizationDto> GetByIdAsync(int id)
    {
        var org = await _orgRepository.GetWithEmployeesAsync(id)
            ?? throw new KeyNotFoundException($"Organization {id} not found.");
        return MapToDto(org);
    }

    public async Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto, int createdByUserId)
    {
        if (await _orgRepository.NameExistsAsync(dto.OrganizationName))
            throw new InvalidOperationException("Organization name already exists.");

        if (await _userRepository.EmailExistsAsync(dto.AdminEmail))
            throw new InvalidOperationException("Admin email already in use.");

        // Get Manager role
        var managerRole = await _roleRepository.GetByNameAsync(Role.Names.Manager)
            ?? throw new InvalidOperationException("Manager role not found.");

        // Create organization admin (Manager user)
        var adminUser = new User
        {
            Email = dto.AdminEmail.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.AdminPassword),
            FirstName = "Organization",
            LastName = "Admin",
            RoleId = managerRole.RoleId,
            IsActive = true
        };

        await _userRepository.AddAsync(adminUser);
        await _userRepository.SaveChangesAsync();

        // Create organization with the admin as creator
        var org = new Organization
        {
            OrganizationName = dto.OrganizationName,
            PartyName = dto.PartyName,
            ContactEmail = dto.ContactEmail,
            Address = dto.Address,
            CreatedByUserId = adminUser.UserId
        };

        await _orgRepository.AddAsync(org);
        await _orgRepository.SaveChangesAsync();

        // Create Employee record for the admin
        var adminEmployee = new Employee
        {
            OrganizationId = org.OrganizationId,
            SupervisedByUserId = createdByUserId,
            FirstName = adminUser.FirstName,
            LastName = adminUser.LastName,
            Email = adminUser.Email,
            IsActive = true
        };

        await _employeeRepository.AddAsync(adminEmployee);
        await _employeeRepository.SaveChangesAsync();

        return MapToDto(org);
    }

    public async Task<OrganizationDto> UpdateAsync(int id, UpdateOrganizationDto dto)
    {
        var org = await _orgRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Organization {id} not found.");

        org.OrganizationName = dto.OrganizationName;
        org.PartyName = dto.PartyName;
        org.ContactEmail = dto.ContactEmail;
        org.Address = dto.Address;

        await _orgRepository.UpdateAsync(org);
        await _orgRepository.SaveChangesAsync();
        return MapToDto(org);
    }

    public async Task DeleteAsync(int id)
    {
        var org = await _orgRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Organization {id} not found.");
        org.IsActive = false;
        await _orgRepository.UpdateAsync(org);
        await _orgRepository.SaveChangesAsync();
    }

    private static OrganizationDto MapToDto(Organization o) => new(
        o.OrganizationId,
        o.OrganizationName,
        o.PartyName,
        o.ContactEmail,
        o.Address,
        o.IsActive,
        o.CreatedAt,
        o.Employees.Count);
}
