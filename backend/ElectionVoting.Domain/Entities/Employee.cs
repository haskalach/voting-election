namespace ElectionVoting.Domain.Entities;

public class Employee
{
    public int EmployeeId { get; set; }
    public int OrganizationId { get; set; }
    public int SupervisedByUserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActivityAt { get; set; }

    public Organization Organization { get; set; } = null!;
    public User SupervisedByUser { get; set; } = null!;
    public ICollection<VoterAttendance> VoterAttendances { get; set; } = new List<VoterAttendance>();
    public ICollection<VoteCount> VoteCounts { get; set; } = new List<VoteCount>();
}
