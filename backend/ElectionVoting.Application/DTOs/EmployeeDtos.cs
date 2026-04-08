using System.ComponentModel.DataAnnotations;

namespace ElectionVoting.Application.DTOs;

public record CreateEmployeeDto(
    [Required][MaxLength(100)] string FirstName,
    [Required][MaxLength(100)] string LastName,
    [Required][EmailAddress][MaxLength(255)] string Email,
    [Required][MinLength(8)] string Password,
    [Required][Phone][MaxLength(20)] string PhoneNumber,
    [DataType(DataType.Date)] DateTime? DateOfBirth);

public record UpdateEmployeeDto(
    [Required][MaxLength(100)] string FirstName,
    [Required][MaxLength(100)] string LastName,
    [Required][EmailAddress][MaxLength(255)] string Email,
    [Required][Phone][MaxLength(20)] string PhoneNumber,
    [DataType(DataType.Date)] DateTime? DateOfBirth,
    bool IsActive);

public record EmployeeDto(
    int EmployeeId,
    int OrganizationId,
    string OrganizationName,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateTime? DateOfBirth,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastActivityAt);

public record EmployeeSummaryDto(
    int EmployeeId,
    string FirstName,
    string LastName,
    string Email,
    bool IsActive);
