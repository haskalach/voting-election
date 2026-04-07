namespace ElectionVoting.Domain.Entities;

public class PollingStation
{
    public int PollingStationId { get; set; }
    public int OrganizationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Organization Organization { get; set; } = null!;
    public ICollection<VoterAttendance> VoterAttendances { get; set; } = new List<VoterAttendance>();
    public ICollection<VoteCount> VoteCounts { get; set; } = new List<VoteCount>();
}
