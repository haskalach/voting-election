namespace ElectionVoting.Domain.Entities;

public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();

    public static class Names
    {
        public const string SystemOwner = "SystemOwner";
        public const string Manager = "Manager";
        public const string Employee = "Employee";
    }
}
