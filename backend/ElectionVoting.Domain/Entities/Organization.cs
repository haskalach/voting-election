namespace ElectionVoting.Domain.Entities;

public class Organization
{
    public int OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string PartyName { get; set; } = string.Empty;
    public int CreatedByUserId { get; set; }
    public string ContactEmail { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedByUser { get; set; } = null!;
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<PollingStation> PollingStations { get; set; } = new List<PollingStation>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
