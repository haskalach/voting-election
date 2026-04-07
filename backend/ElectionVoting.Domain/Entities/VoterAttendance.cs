namespace ElectionVoting.Domain.Entities;

public class VoterAttendance
{
    public int AttendanceId { get; set; }
    public int EmployeeId { get; set; }
    public int PollingStationId { get; set; }
    public int VoterCount { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Employee Employee { get; set; } = null!;
    public PollingStation PollingStation { get; set; } = null!;
}
