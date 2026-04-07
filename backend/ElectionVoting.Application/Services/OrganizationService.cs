using ElectionVoting.Application.DTOs;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;

namespace ElectionVoting.Application.Services;

public class OrganizationService : IOrganizationService
{
    private readonly IOrganizationRepository _orgRepository;

    public OrganizationService(IOrganizationRepository orgRepository)
    {
        _orgRepository = orgRepository;
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

        var org = new Organization
        {
            OrganizationName = dto.OrganizationName,
            PartyName = dto.PartyName,
            ContactEmail = dto.ContactEmail,
            Address = dto.Address,
            CreatedByUserId = createdByUserId
        };

        await _orgRepository.AddAsync(org);
        await _orgRepository.SaveChangesAsync();
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
