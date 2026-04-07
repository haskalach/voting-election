using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.EntityFrameworkCore;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Infrastructure.Data;
using ElectionVoting.Infrastructure.Repositories;

namespace ElectionVoting.Tests;

/// <summary>
/// Repository Integration Tests using EF Core InMemory database.
/// These tests verify actual LINQ/EF Core query behavior in repositories.
/// </summary>
public class OrganizationRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly OrganizationRepository _repo;

    public OrganizationRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"OrgRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _repo = new OrganizationRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private static Organization CreateOrg(int id, string name, int createdByUserId = 1) => new()
    {
        OrganizationId = id,
        OrganizationName = name,
        PartyName = $"Party {id}",
        ContactEmail = $"org{id}@test.com",
        Address = $"{id} Test St",
        IsActive = true,
        CreatedByUserId = createdByUserId
    };

    [Fact]
    public async Task GetAllAsync_ReturnsAllOrganizations()
    {
        // Arrange
        _context.Organizations.AddRange(CreateOrg(1, "Org A"), CreateOrg(2, "Org B"));
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetAllAsync()).ToList();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsOrganization()
    {
        // Arrange
        _context.Organizations.Add(CreateOrg(1, "Test Org"));
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Org", result.OrganizationName);
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ReturnsNull()
    {
        // Act
        var result = await _repo.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task AddAsync_PersistsNewOrganization()
    {
        // Arrange
        var org = CreateOrg(1, "New Org");

        // Act
        await _repo.AddAsync(org);
        await _repo.SaveChangesAsync();

        // Assert
        var saved = await _context.Organizations.FindAsync(1);
        Assert.NotNull(saved);
        Assert.Equal("New Org", saved.OrganizationName);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChanges()
    {
        // Arrange
        var org = CreateOrg(1, "Original");
        _context.Organizations.Add(org);
        await _context.SaveChangesAsync();

        // Act
        org.OrganizationName = "Updated";
        await _repo.UpdateAsync(org);
        await _repo.SaveChangesAsync();

        // Assert
        var updated = await _context.Organizations.FindAsync(1);
        Assert.Equal("Updated", updated!.OrganizationName);
    }

    [Fact]
    public async Task DeleteAsync_RemovesOrganization()
    {
        // Arrange
        var org = CreateOrg(1, "To Delete");
        _context.Organizations.Add(org);
        await _context.SaveChangesAsync();

        // Act
        await _repo.DeleteAsync(org);
        await _repo.SaveChangesAsync();

        // Assert
        var deleted = await _context.Organizations.FindAsync(1);
        Assert.Null(deleted);
    }

    [Fact]
    public async Task NameExistsAsync_WithExistingName_ReturnsTrue()
    {
        // Arrange
        _context.Organizations.Add(CreateOrg(1, "Existing Name"));
        await _context.SaveChangesAsync();

        // Act
        var exists = await _repo.NameExistsAsync("Existing Name");

        // Assert
        Assert.True(exists);
    }

    [Fact]
    public async Task NameExistsAsync_WithNewName_ReturnsFalse()
    {
        // Act
        var exists = await _repo.NameExistsAsync("Nonexistent Org");

        // Assert
        Assert.False(exists);
    }

    [Fact]
    public async Task GetWithEmployeesAsync_ReturnsOrgWithEmployees()
    {
        // Arrange
        var org = CreateOrg(1, "Org With Employees");
        _context.Organizations.Add(org);

        var role = new Role { RoleId = 3, RoleName = Role.Names.Employee };
        _context.Roles.Add(role);

        var user1 = new User { UserId = 10, Email = "e1@test.com", PasswordHash = "h", FirstName = "A", LastName = "B", RoleId = 3 };
        var user2 = new User { UserId = 11, Email = "e2@test.com", PasswordHash = "h", FirstName = "C", LastName = "D", RoleId = 3 };
        _context.Users.AddRange(user1, user2);
        await _context.SaveChangesAsync();

        var emp1 = new Employee { EmployeeId = 1, OrganizationId = 1, UserId = 10, FirstName = "A", LastName = "B", Email = "e1@test.com" };
        var emp2 = new Employee { EmployeeId = 2, OrganizationId = 1, UserId = 11, FirstName = "C", LastName = "D", Email = "e2@test.com" };
        _context.Employees.AddRange(emp1, emp2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetWithEmployeesAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Employees.Count);
    }

    [Fact]
    public async Task GetByOwnerAsync_ReturnsOrgsOwnedByUser()
    {
        // Arrange
        _context.Organizations.AddRange(
            CreateOrg(1, "Owner 1 Org A", createdByUserId: 1),
            CreateOrg(2, "Owner 1 Org B", createdByUserId: 1),
            CreateOrg(3, "Owner 2 Org", createdByUserId: 2)
        );
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByOwnerAsync(1)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, o => Assert.Equal(1, o.CreatedByUserId));
    }
}

public class EmployeeRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly EmployeeRepository _repo;

    public EmployeeRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"EmpRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _repo = new EmployeeRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private async Task SeedBasicDataAsync()
    {
        var role = new Role { RoleId = 3, RoleName = Role.Names.Employee };
        _context.Roles.Add(role);

        var org = new Organization { OrganizationId = 1, OrganizationName = "Test Org", PartyName = "TP", CreatedByUserId = 0 };
        _context.Organizations.Add(org);

        var user = new User { UserId = 1, Email = "emp@test.com", PasswordHash = "h", FirstName = "John", LastName = "Doe", RoleId = 3 };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetByOrganizationAsync_ReturnsEmployeesForOrg()
    {
        // Arrange
        await SeedBasicDataAsync();

        _context.Employees.AddRange(
            new Employee { EmployeeId = 1, OrganizationId = 1, UserId = 1, FirstName = "John", LastName = "Doe", Email = "john@test.com" },
            new Employee { EmployeeId = 2, OrganizationId = 1, UserId = 1, FirstName = "Jane", LastName = "Doe", Email = "jane@test.com" },
            new Employee { EmployeeId = 3, OrganizationId = 2, UserId = 1, FirstName = "Bob", LastName = "Doe", Email = "bob@test.com" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByOrganizationAsync(1)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, e => Assert.Equal(1, e.OrganizationId));
    }

    [Fact]
    public async Task GetByOrganizationAsync_ReturnsEmptyForOrgWithNoEmployees()
    {
        // Act
        var result = (await _repo.GetByOrganizationAsync(99)).ToList();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task EmailExistsInOrgAsync_WithExistingEmail_ReturnsTrue()
    {
        // Arrange
        await SeedBasicDataAsync();
        _context.Employees.Add(new Employee
        {
            EmployeeId = 1, OrganizationId = 1, UserId = 1,
            FirstName = "John", LastName = "Doe", Email = "john@test.com"
        });
        await _context.SaveChangesAsync();

        // Act
        var exists = await _repo.EmailExistsInOrgAsync("john@test.com", 1);

        // Assert
        Assert.True(exists);
    }

    [Fact]
    public async Task EmailExistsInOrgAsync_WithEmailInDifferentOrg_ReturnsFalse()
    {
        // Arrange
        await SeedBasicDataAsync();
        _context.Employees.Add(new Employee
        {
            EmployeeId = 1, OrganizationId = 2, UserId = 1,
            FirstName = "John", LastName = "Doe", Email = "john@test.com"
        });
        await _context.SaveChangesAsync();

        // Act — email exists in org 2, but we're checking org 1
        var exists = await _repo.EmailExistsInOrgAsync("john@test.com", 1);

        // Assert
        Assert.False(exists);
    }

    [Fact]
    public async Task GetByUserIdAsync_WithValidUserId_ReturnsEmployee()
    {
        // Arrange
        await SeedBasicDataAsync();
        _context.Employees.Add(new Employee
        {
            EmployeeId = 1, OrganizationId = 1, UserId = 1,
            FirstName = "John", LastName = "Doe", Email = "john@test.com"
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetByUserIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.UserId);
    }

    [Fact]
    public async Task GetByUserIdAsync_WithInvalidUserId_ReturnsNull()
    {
        // Act
        var result = await _repo.GetByUserIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetWithOrganizationAsync_IncludesOrganization()
    {
        // Arrange
        await SeedBasicDataAsync();
        _context.Employees.Add(new Employee
        {
            EmployeeId = 1, OrganizationId = 1, UserId = 1,
            FirstName = "John", LastName = "Doe", Email = "john@test.com"
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetWithOrganizationAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Organization);
        Assert.Equal("Test Org", result.Organization.OrganizationName);
    }

    [Fact]
    public async Task AddAsync_ThenSave_PersistsEmployee()
    {
        // Arrange
        await SeedBasicDataAsync();
        var emp = new Employee
        {
            EmployeeId = 1, OrganizationId = 1, UserId = 1,
            FirstName = "New", LastName = "Employee", Email = "new@test.com"
        };

        // Act
        await _repo.AddAsync(emp);
        await _repo.SaveChangesAsync();

        // Assert
        var count = await _context.Employees.CountAsync();
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task DeleteAsync_ThenSave_RemovesEmployee()
    {
        // Arrange
        await SeedBasicDataAsync();
        var emp = new Employee
        {
            EmployeeId = 1, OrganizationId = 1, UserId = 1,
            FirstName = "Delete", LastName = "Me", Email = "delete@test.com"
        };
        _context.Employees.Add(emp);
        await _context.SaveChangesAsync();

        // Act
        await _repo.DeleteAsync(emp);
        await _repo.SaveChangesAsync();

        // Assert
        var count = await _context.Employees.CountAsync();
        Assert.Equal(0, count);
    }
}

public class UserRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly UserRepository _repo;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"UserRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _context.Database.EnsureCreated(); // applies HasData seeding (roles)
        _repo = new UserRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private static User CreateUser(int id, string email, int roleId = 3) => new()
    {
        UserId = id,
        Email = email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("test"),
        FirstName = $"User{id}",
        LastName = "Test",
        RoleId = roleId,
        IsActive = true
    };

    [Fact]
    public async Task GetByEmailAsync_WithValidEmail_ReturnsUser()
    {
        // Arrange
        _context.Users.Add(CreateUser(1, "user@test.com"));
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetByEmailAsync("user@test.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("user@test.com", result.Email);
    }

    [Fact]
    public async Task GetByEmailAsync_WithNonexistentEmail_ReturnsNull()
    {
        // Act
        var result = await _repo.GetByEmailAsync("notexists@test.com");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task EmailExistsAsync_WithExistingEmail_ReturnsTrue()
    {
        // Arrange
        _context.Users.Add(CreateUser(1, "exists@test.com"));
        await _context.SaveChangesAsync();

        // Act
        var exists = await _repo.EmailExistsAsync("exists@test.com");

        // Assert
        Assert.True(exists);
    }

    [Fact]
    public async Task EmailExistsAsync_WithNonexistentEmail_ReturnsFalse()
    {
        // Act
        var exists = await _repo.EmailExistsAsync("new@test.com");

        // Assert
        Assert.False(exists);
    }

    [Fact]
    public async Task GetByIdWithRoleAsync_IncludesRole()
    {
        // Arrange - Role 3 (Employee) is already seeded via EnsureCreated HasData
        _context.Users.Add(CreateUser(1, "user@test.com", roleId: 3));
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetByIdWithRoleAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Role);
        Assert.Equal(Role.Names.Employee, result.Role.RoleName);
    }

    [Fact]
    public async Task GetByIdWithRoleAsync_WithInvalidId_ReturnsNull()
    {
        // Act
        var result = await _repo.GetByIdWithRoleAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task AddAsync_ThenSave_PersistsUser()
    {
        // Arrange
        var user = CreateUser(1, "new@test.com");

        // Act
        await _repo.AddAsync(user);
        await _repo.SaveChangesAsync();

        // Assert - verify directly in context to avoid Include() side effects
        var saved = await _context.Users.FindAsync(1);
        Assert.NotNull(saved);
        Assert.Equal("new@test.com", saved.Email);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllUsers()
    {
        // Arrange
        _context.Users.AddRange(
            CreateUser(1, "u1@test.com"),
            CreateUser(2, "u2@test.com"),
            CreateUser(3, "u3@test.com")
        );
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetAllAsync()).ToList();

        // Assert
        Assert.Equal(3, result.Count);
    }
}

public class RefreshTokenRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly RefreshTokenRepository _repo;

    public RefreshTokenRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"RefreshTokenRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _context.Database.EnsureCreated();
        _context.Roles.Add(new Role { RoleId = 99, RoleName = "TestRole" });
        _context.SaveChanges();
        _repo = new RefreshTokenRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private async Task<User> SeedUserAsync(int userId, string email)
    {
        var user = new User { UserId = userId, Email = email, FirstName = "Test", LastName = "User", PasswordHash = "hash", RoleId = 1, IsActive = true };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    [Fact]
    public async Task GetValidTokenAsync_WithValidToken_ReturnsToken()
    {
        // Arrange
        await SeedUserAsync(1, "u@test.com");
        var token = new RefreshToken { UserId = 1, Token = "valid-token-abc", ExpiresAt = DateTime.UtcNow.AddDays(7), IsRevoked = false };
        _context.RefreshTokens.Add(token);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetValidTokenAsync("valid-token-abc");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("valid-token-abc", result!.Token);
    }

    [Fact]
    public async Task GetValidTokenAsync_WithExpiredToken_ReturnsNull()
    {
        // Arrange
        await SeedUserAsync(2, "u2@test.com");
        var token = new RefreshToken { UserId = 2, Token = "expired-token", ExpiresAt = DateTime.UtcNow.AddDays(-1), IsRevoked = false };
        _context.RefreshTokens.Add(token);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetValidTokenAsync("expired-token");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetValidTokenAsync_WithRevokedToken_ReturnsNull()
    {
        // Arrange
        await SeedUserAsync(3, "u3@test.com");
        var token = new RefreshToken { UserId = 3, Token = "revoked-token", ExpiresAt = DateTime.UtcNow.AddDays(7), IsRevoked = true };
        _context.RefreshTokens.Add(token);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.GetValidTokenAsync("revoked-token");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task RevokeAllUserTokensAsync_RevokesOnlyUserTokens()
    {
        // Arrange
        await SeedUserAsync(4, "u4@test.com");
        await SeedUserAsync(5, "u5@test.com");
        _context.RefreshTokens.AddRange(
            new RefreshToken { UserId = 4, Token = "token-u4-1", ExpiresAt = DateTime.UtcNow.AddDays(7), IsRevoked = false },
            new RefreshToken { UserId = 4, Token = "token-u4-2", ExpiresAt = DateTime.UtcNow.AddDays(7), IsRevoked = false },
            new RefreshToken { UserId = 5, Token = "token-u5-1", ExpiresAt = DateTime.UtcNow.AddDays(7), IsRevoked = false }
        );
        await _context.SaveChangesAsync();

        // Act
        await _repo.RevokeAllUserTokensAsync(4);

        // Assert
        var u4Tokens = _context.RefreshTokens.Where(t => t.UserId == 4).ToList();
        var u5Tokens = _context.RefreshTokens.Where(t => t.UserId == 5).ToList();
        Assert.All(u4Tokens, t => Assert.True(t.IsRevoked));
        Assert.All(u5Tokens, t => Assert.False(t.IsRevoked));
    }
}

public class RoleRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly RoleRepository _repo;

    public RoleRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"RoleRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _context.Database.EnsureCreated(); // Seeds roles 1=SystemOwner, 2=Manager, 3=Employee
        _repo = new RoleRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task GetByNameAsync_WithValidName_ReturnsRole()
    {
        // Act
        var result = await _repo.GetByNameAsync(Role.Names.Employee);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(Role.Names.Employee, result!.RoleName);
    }

    [Fact]
    public async Task GetByNameAsync_WithInvalidName_ReturnsNull()
    {
        // Act
        var result = await _repo.GetByNameAsync("NonExistentRole");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByNameAsync_WithManagerRole_ReturnsManagerRole()
    {
        // Act
        var result = await _repo.GetByNameAsync(Role.Names.Manager);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(Role.Names.Manager, result!.RoleName);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllSeededRoles()
    {
        // Act
        var result = (await _repo.GetAllAsync()).ToList();

        // Assert
        Assert.Equal(3, result.Count);
    }
}

public class PollingStationRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly PollingStationRepository _repo;

    public PollingStationRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"PollingStationRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _repo = new PollingStationRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private async Task SeedOrgAndUserAsync()
    {
        _context.Database.EnsureCreated();
        _context.Users.Add(new User { UserId = 1, Email = "admin@test.com", FirstName = "A", LastName = "B", PasswordHash = "h", RoleId = 1 });
        _context.Organizations.Add(new Organization { OrganizationId = 1, OrganizationName = "Org 1", PartyName = "Party 1", CreatedByUserId = 1 });
        _context.Organizations.Add(new Organization { OrganizationId = 2, OrganizationName = "Org 2", PartyName = "Party 2", CreatedByUserId = 1 });
        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetByOrganizationAsync_ReturnsStationsForOrg()
    {
        // Arrange
        await SeedOrgAndUserAsync();
        _context.PollingStations.AddRange(
            new PollingStation { PollingStationId = 1, OrganizationId = 1, StationName = "Station A", Location = "A", Address = "1 A St", Capacity = 100 },
            new PollingStation { PollingStationId = 2, OrganizationId = 1, StationName = "Station B", Location = "B", Address = "2 B St", Capacity = 200 },
            new PollingStation { PollingStationId = 3, OrganizationId = 2, StationName = "Station C", Location = "C", Address = "3 C St", Capacity = 150 }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByOrganizationAsync(1)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, s => Assert.Equal(1, s.OrganizationId));
    }

    [Fact]
    public async Task GetByOrganizationAsync_WithNoStations_ReturnsEmpty()
    {
        // Arrange
        await SeedOrgAndUserAsync();

        // Act
        var result = (await _repo.GetByOrganizationAsync(1)).ToList();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task AddAsync_ThenGetAll_ReturnsStation()
    {
        // Arrange
        await SeedOrgAndUserAsync();
        var station = new PollingStation { PollingStationId = 10, OrganizationId = 1, StationName = "New Station", Location = "X", Address = "10 X St", Capacity = 50 };

        // Act
        await _repo.AddAsync(station);
        await _repo.SaveChangesAsync();

        // Assert
        var all = (await _repo.GetAllAsync()).ToList();
        Assert.Single(all);
    }
}

public class VoteCountRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly VoteCountRepository _repo;

    public VoteCountRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"VoteCountRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _repo = new VoteCountRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private async Task SeedDataAsync()
    {
        _context.Database.EnsureCreated();
        _context.Users.Add(new User { UserId = 1, Email = "m@test.com", FirstName = "M", LastName = "N", PasswordHash = "h", RoleId = 1 });
        _context.Organizations.Add(new Organization { OrganizationId = 1, OrganizationName = "Org", PartyName = "Party", CreatedByUserId = 1 });
        _context.PollingStations.Add(new PollingStation { PollingStationId = 1, OrganizationId = 1, StationName = "S1", Location = "L", Address = "A", Capacity = 100 });
        _context.Users.Add(new User { UserId = 2, Email = "e@test.com", FirstName = "E", LastName = "F", PasswordHash = "h", RoleId = 3 });
        _context.Employees.Add(new Employee { EmployeeId = 1, OrganizationId = 1, UserId = 2, SupervisedByUserId = 1, FirstName = "E", LastName = "F", Email = "e@test.com" });
        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetByEmployeeAsync_WithVotes_ReturnsVotes()
    {
        // Arrange
        await SeedDataAsync();
        _context.VoteCounts.AddRange(
            new VoteCount { VoteCountId = 1, EmployeeId = 1, PollingStationId = 1, CandidateName = "Alice", Votes = 50, RecordedAt = DateTime.UtcNow },
            new VoteCount { VoteCountId = 2, EmployeeId = 1, PollingStationId = 1, CandidateName = "Bob", Votes = 30, RecordedAt = DateTime.UtcNow }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByEmployeeAsync(1)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByOrganizationAsync_WithVotes_ReturnsOrgVotes()
    {
        // Arrange
        await SeedDataAsync();
        _context.VoteCounts.Add(new VoteCount { VoteCountId = 3, EmployeeId = 1, PollingStationId = 1, CandidateName = "Alice", Votes = 25, RecordedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByOrganizationAsync(1)).ToList();

        // Assert
        Assert.Single(result);
    }

    [Fact]
    public async Task GetByStationAsync_WithVotes_ReturnsStationVotes()
    {
        // Arrange
        await SeedDataAsync();
        _context.VoteCounts.Add(new VoteCount { VoteCountId = 4, EmployeeId = 1, PollingStationId = 1, CandidateName = "Charlie", Votes = 10, RecordedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByStationAsync(1)).ToList();

        // Assert
        Assert.Single(result);
    }

    [Fact]
    public async Task ExistsForCandidateOnDateAsync_WhenExists_ReturnsTrue()
    {
        // Arrange
        await SeedDataAsync();
        var today = DateTime.UtcNow.Date;
        _context.VoteCounts.Add(new VoteCount { VoteCountId = 5, EmployeeId = 1, PollingStationId = 1, CandidateName = "Diana", Votes = 5, RecordedAt = today });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.ExistsForCandidateOnDateAsync(1, 1, "Diana", today);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task ExistsForCandidateOnDateAsync_WhenNotExists_ReturnsFalse()
    {
        // Arrange
        await SeedDataAsync();

        // Act
        var result = await _repo.ExistsForCandidateOnDateAsync(1, 1, "Nobody", DateTime.UtcNow.Date);

        // Assert
        Assert.False(result);
    }
}

public class VoterAttendanceRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly VoterAttendanceRepository _repo;

    public VoterAttendanceRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"VoterAttendanceRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _repo = new VoterAttendanceRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private async Task SeedDataAsync()
    {
        _context.Database.EnsureCreated();
        _context.Users.Add(new User { UserId = 1, Email = "m@va.com", FirstName = "M", LastName = "N", PasswordHash = "h", RoleId = 1 });
        _context.Organizations.Add(new Organization { OrganizationId = 1, OrganizationName = "OrgVA", PartyName = "PartyVA", CreatedByUserId = 1 });
        _context.PollingStations.Add(new PollingStation { PollingStationId = 1, OrganizationId = 1, StationName = "S1", Location = "L", Address = "A", Capacity = 100 });
        _context.Users.Add(new User { UserId = 2, Email = "e@va.com", FirstName = "E", LastName = "F", PasswordHash = "h", RoleId = 3 });
        _context.Employees.Add(new Employee { EmployeeId = 1, OrganizationId = 1, UserId = 2, SupervisedByUserId = 1, FirstName = "E", LastName = "F", Email = "e@va.com" });
        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetByEmployeeAsync_ReturnsAttendance()
    {
        // Arrange
        await SeedDataAsync();
        _context.VoterAttendances.Add(new VoterAttendance { AttendanceId = 1, EmployeeId = 1, PollingStationId = 1, VoterCount = 100, RecordedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByEmployeeAsync(1)).ToList();

        // Assert
        Assert.Single(result);
    }

    [Fact]
    public async Task GetByOrganizationAsync_ReturnsOrgAttendance()
    {
        // Arrange
        await SeedDataAsync();
        _context.VoterAttendances.Add(new VoterAttendance { AttendanceId = 2, EmployeeId = 1, PollingStationId = 1, VoterCount = 50, RecordedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByOrganizationAsync(1)).ToList();

        // Assert
        Assert.Single(result);
    }

    [Fact]
    public async Task ExistsForEmployeeOnDateAsync_WhenExists_ReturnsTrue()
    {
        // Arrange
        await SeedDataAsync();
        var today = DateTime.UtcNow.Date;
        _context.VoterAttendances.Add(new VoterAttendance { AttendanceId = 3, EmployeeId = 1, PollingStationId = 1, VoterCount = 20, RecordedAt = today });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repo.ExistsForEmployeeOnDateAsync(1, 1, today);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task ExistsForEmployeeOnDateAsync_WhenNotExists_ReturnsFalse()
    {
        // Arrange
        await SeedDataAsync();

        // Act
        var result = await _repo.ExistsForEmployeeOnDateAsync(999, 1, DateTime.UtcNow.Date);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task GetByStationAsync_ReturnsAttendanceForStation()
    {
        // Arrange
        await SeedDataAsync();
        _context.VoterAttendances.Add(new VoterAttendance { AttendanceId = 4, EmployeeId = 1, PollingStationId = 1, VoterCount = 75, RecordedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByStationAsync(1)).ToList();

        // Assert
        Assert.Single(result);
        Assert.Equal(1, result[0].PollingStationId);
    }
}

public class AuditLogRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly AuditLogRepository _repo;

    public AuditLogRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"AuditLogRepoTest_{Guid.NewGuid()}")
            .Options;
        _context = new AppDbContext(options);
        _context.Database.EnsureCreated();
        _repo = new AuditLogRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private async Task SeedBaseDataAsync()
    {
        _context.Users.Add(new User { UserId = 1, Email = "u@test.com", FirstName = "Admin", LastName = "User", PasswordHash = "h", RoleId = 1 });
        _context.Organizations.Add(new Organization { OrganizationId = 1, OrganizationName = "Org1", PartyName = "Party1", CreatedByUserId = 1 });
        await _context.SaveChangesAsync();
    }

    private AuditLog MakeLog(int id, int orgId = 1, string entity = "Employee") => new()
    {
        AuditId = id,
        UserId = 1,
        OrganizationId = orgId,
        EntityType = entity,
        EntityId = id,
        Action = "Create",
        Timestamp = DateTime.UtcNow.AddMinutes(-id)
    };

    [Fact]
    public async Task GetByOrganizationAsync_ReturnsLogsForOrg()
    {
        // Arrange
        await SeedBaseDataAsync();
        _context.AuditLogs.AddRange(MakeLog(1), MakeLog(2), MakeLog(3, orgId: 99));
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByOrganizationAsync(1)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByUserAsync_ReturnsLogsForUser()
    {
        // Arrange
        await SeedBaseDataAsync();
        _context.AuditLogs.AddRange(MakeLog(1), MakeLog(2));
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByUserAsync(1)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByEntityAsync_ReturnsLogsForEntity()
    {
        // Arrange
        await SeedBaseDataAsync();
        _context.AuditLogs.AddRange(
            MakeLog(1, entity: "Employee"),
            MakeLog(2, entity: "Employee"),
            MakeLog(3, entity: "Organization")
        );
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetByEntityAsync("Employee", 1)).ToList();

        // Assert
        Assert.Single(result); // EntityId=1 and EntityType=Employee
    }

    [Fact]
    public async Task GetRecentAsync_ReturnsTopNLogs()
    {
        // Arrange
        await SeedBaseDataAsync();
        _context.AuditLogs.AddRange(MakeLog(1), MakeLog(2), MakeLog(3), MakeLog(4), MakeLog(5));
        await _context.SaveChangesAsync();

        // Act
        var result = (await _repo.GetRecentAsync(3)).ToList();

        // Assert
        Assert.Equal(3, result.Count);
    }
}
