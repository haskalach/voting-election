using ElectionVoting.Application.DTOs;
using ElectionVoting.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectionVoting.Api.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = "SystemOwner,Manager")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogRepository _auditRepo;

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

    /// <summary>Get audit logs for a specific organization</summary>
    [HttpGet("organization/{orgId:int}")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByOrganization(int orgId)
    {
        var logs = await _auditRepo.GetByOrganizationAsync(orgId);
        return Ok(logs.Select(ToDto));
    }

    /// <summary>Get recent audit logs across the system (SystemOwner only)</summary>
    [HttpGet("recent")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetRecent([FromQuery] int count = 50)
    {
        if (count > 200) count = 200;
        var logs = await _auditRepo.GetRecentAsync(count);
        return Ok(logs.Select(ToDto));
    }

    /// <summary>Get audit logs for a specific user</summary>
    [HttpGet("user/{userId:int}")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByUser(int userId)
    {
        var logs = await _auditRepo.GetByUserAsync(userId);
        return Ok(logs.Select(ToDto));
    }

    /// <summary>Get audit logs for a specific entity (e.g., Organization, Employee)</summary>
    [HttpGet("entity/{entityType}/{entityId:int}")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByEntity(string entityType, int entityId)
    {
        var logs = await _auditRepo.GetByEntityAsync(entityType, entityId);
        return Ok(logs.Select(ToDto));
    }
}
