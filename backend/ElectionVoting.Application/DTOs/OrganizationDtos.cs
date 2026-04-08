using System.ComponentModel.DataAnnotations;

namespace ElectionVoting.Application.DTOs;

public record CreateOrganizationDto(
    [Required][MaxLength(200)] string OrganizationName,
    [Required][MaxLength(200)] string PartyName,
    [Required][EmailAddress][MaxLength(255)] string ContactEmail,
    [Required][MaxLength(500)] string Address,
    [Required][EmailAddress][MaxLength(255)] string AdminEmail,
    [Required][MinLength(8)] string AdminPassword,
    [Required][MaxLength(100)] string AdminFirstName,
    [Required][MaxLength(100)] string AdminLastName);

public record UpdateOrganizationDto(
    [Required][MaxLength(200)] string OrganizationName,
    [Required][MaxLength(200)] string PartyName,
    [Required][EmailAddress][MaxLength(255)] string ContactEmail,
    [Required][MaxLength(500)] string Address);

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
