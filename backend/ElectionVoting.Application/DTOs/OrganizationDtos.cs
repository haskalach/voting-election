namespace ElectionVoting.Application.DTOs;

public record CreateOrganizationDto(
    string OrganizationName,
    string PartyName,
    string ContactEmail,
    string Address,
    string AdminEmail,
    string AdminPassword);

public record UpdateOrganizationDto(
    string OrganizationName,
    string PartyName,
    string ContactEmail,
    string Address);

public record OrganizationDto(
    int OrganizationId,
    string OrganizationName,
    string PartyName,
    string ContactEmail,
    string Address,
    bool IsActive,
    DateTime CreatedAt,
    int EmployeeCount);

public record OrganizationSummaryDto(
    int OrganizationId,
    string OrganizationName,
    string PartyName,
    bool IsActive,
    int EmployeeCount);
