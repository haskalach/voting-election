namespace ElectionVoting.Domain.Entities;

public class VoteCount
{
    public int VoteCountId { get; set; }
    public int EmployeeId { get; set; }
    public int PollingStationId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public int Votes { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Employee Employee { get; set; } = null!;
    public PollingStation PollingStation { get; set; } = null!;
}
