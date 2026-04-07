namespace ElectionVoting.Application.DTOs;

public record CreateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateTime? DateOfBirth);

public record UpdateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateTime? DateOfBirth,
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
