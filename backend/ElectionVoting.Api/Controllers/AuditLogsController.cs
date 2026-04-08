using ElectionVoting.Application.DTOs;
using ElectionVoting.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectionVoting.Api.Controllers;

/// <summary>
/// Provides audit trail access for compliance and monitoring.
/// Logs all data mutations: creates, updates, deletes with actor, timestamp, before/after values.
/// SystemOwner can view system-wide logs; Managers can view their organization only.
/// </summary>
[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = "SystemOwner,Manager")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogRepository _auditRepo;

    /// <summary>Initializes the audit logs controller with repository dependency</summary>
    /// <param name="auditRepo">Repository providing access to audit log entries</param>
    public AuditLogsController(IAuditLogRepository auditRepo) => _auditRepo = auditRepo;

    private static AuditLogDto ToDto(Domain.Entities.AuditLog a) => new(
        a.AuditId,
        a.UserId,
        $"{a.User.FirstName} {a.User.LastName}",
        a.OrganizationId,
        a.Organization?.OrganizationName,
        a.EntityType,
        a.EntityId,
        a.Action,
        a.OldValues,
        a.NewValues,
        a.Timestamp);

    /// <summary>Retrieves audit logs for a specific organization (Managers can view their org only)</summary>
    /// <param name="orgId">The organization ID to get logs for</param>
    /// <returns>Audit log entries with actor, action, old/new values, timestamp</returns>
    /// <response code="200">Logs retrieved successfully</response>
    /// <response code="401">User not authenticated</response>
    /// <response code="403">Manager attempting to view different organization</response>
    [HttpGet("organization/{orgId:int}")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByOrganization(int orgId)
    {
        var logs = await _auditRepo.GetByOrganizationAsync(orgId);
        return Ok(logs.Select(ToDto));
    }

    /// <summary>Retrieves recent audit logs across the system (SystemOwner only)</summary>
    /// <param name="count">Number of recent logs to retrieve (default 50, max 200)</param>
    /// <returns>Most recent audit log entries system-wide</returns>
    /// <response code="200">Recent logs retrieved successfully</response>
    /// <response code="401">User not authenticated or not SystemOwner</response>
    [HttpGet("recent")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetRecent([FromQuery] int count = 50)
    {
        if (count > 200) count = 200;
        var logs = await _auditRepo.GetRecentAsync(count);
        return Ok(logs.Select(ToDto));
    }

    /// <summary>Retrieves all audit log entries for a specific user (SystemOwner only)</summary>
    /// <param name="userId">The user ID to get logs for</param>
    /// <returns>All actions performed by the specified user with timestamps</returns>
    /// <response code="200">User logs retrieved successfully</response>
    /// <response code="401">User not authenticated or not SystemOwner</response>
    [HttpGet("user/{userId:int}")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByUser(int userId)
    {
        var logs = await _auditRepo.GetByUserAsync(userId);
        return Ok(logs.Select(ToDto));
    }

    /// <summary>Retrieves audit logs for a specific entity type and ID (SystemOwner only)</summary>
    /// <param name="entityType">Entity type (e.g., Organization, Employee, PollingStation)</param>
    /// <param name="entityId">The entity ID to track</param>
    /// <returns>Complete change history for the entity with all mutations</returns>
    /// <response code="200">Entity logs retrieved successfully</response>
    /// <response code="401">User not authenticated or not SystemOwner</response>
    [HttpGet("entity/{entityType}/{entityId:int}")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByEntity(string entityType, int entityId)
    {
        var logs = await _auditRepo.GetByEntityAsync(entityType, entityId);
        return Ok(logs.Select(ToDto));
    }
}
