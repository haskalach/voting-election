namespace ElectionVoting.Application.DTOs;

public record AuditLogDto(
    int AuditId,
    int UserId,
    string UserName,
    int? OrganizationId,
    string? OrganizationName,
    string EntityType,
    int EntityId,
    string Action,
    string? OldValues,
    string? NewValues,
    DateTime Timestamp);
