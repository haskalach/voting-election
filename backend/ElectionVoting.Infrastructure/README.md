# ElectionVoting.Infrastructure

**Infrastructure Layer** - Data access, persistence, and external system integration for the Election Voting System.

## Overview

The Infrastructure layer handles all concerns regarding data persistence, database access, migrations, and external system integration. It implements repository patterns and provides Entity Framework Core DbContext configuration for the entire application.

## Key Responsibilities

- **Database access**: Repository pattern over Entity Framework Core
- **Data persistence**: Entity mapping, migrations, and schema management
- **Transaction management**: Unit of Work pattern for coordinated changes
- **Seeding**: Initial data setup for development and testing
- **Configuration**: Connection strings, logging, dependency injection

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│ ElectionVoting.Api (Controllers)            │
└──────────────────┬──────────────────────────┘
                   │ (depends on)
┌──────────────────▼──────────────────────────┐
│ ElectionVoting.Application (DTOs, Services) │
└──────────────────┬──────────────────────────┘
                   │ (depends on)
┌──────────────────▼──────────────────────────┐
│ ElectionVoting.Infrastructure (This layer)  │
│ ├─ DbContext (Entity mapping)               │
│ ├─ Repositories (Data access)               │
│ ├─ Migrations (Schema versioning)           │
│ └─ ServiceConfiguration (DI setup)          │
└──────────────────┬──────────────────────────┘
                   │ (depends on)
┌──────────────────▼──────────────────────────┐
│ ElectionVoting.Domain (Entities, Interfaces)│
└─────────────────────────────────────────────┘
```

## Directory Structure

### `/Data` - Database Context & Migrations

```
├── ElectionVotingDbContext.cs  # EF Core DbContext with all entity mappings
├── Migrations/                 # Database schema version history
│   ├── 20240401_InitialCreate.cs
│   ├── 20240415_AddAuditTable.cs
│   └── ...migration history...
└── DatabaseSeeder.cs           # Initial data population for dev/test
```

**DbContext Features**:

- All entities fluently configured with .HasKey(), .HasMany(), etc.
- Relationships: One-to-Many (Org→Employees), Many-to-Many (Roles)
- Indexes on frequently queried columns (Email, OrganizationId)
- Cascade delete configured for referential integrity
- Shadow properties for audit fields (CreatedAt, UpdatedAt)

**Migrations**:

```bash
# Create new migration
dotnet ef migrations add MigrationName

# Apply to database
dotnet ef database update

# Revert last migration
dotnet ef migrations remove
```

### `/Repositories` - Data Access Implementations

Repository pattern: Abstract away EF Core details from services.

```
├── IUnitOfWork.cs              # Transaction boundary interface
├── UnitOfWork.cs               # Transaction coordination
├── Repository{T}.cs            # Generic CRUD repository
├── UserRepository.cs           # User-specific queries
├── EmployeeRepository.cs       # Employee-specific queries (includes related data)
├── OrganizationRepository.cs   # Organization queries with employee counts
├── PollingStationRepository.cs # Polling station queries
├── AuditLogRepository.cs       # Audit trail access
└── DashboardDataRepository.cs  # Aggregated analytics queries
```

**Generic Repository Pattern**:

```csharp
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}

// Implementation: Uses DbContext.Set<T>
public class Repository<T> : IRepository<T> where T : class
{
    private readonly ElectionVotingDbContext _context;

    public async Task<T> GetByIdAsync(int id) =>
        await _context.Set<T>().FindAsync(id);

    // ... other methods
}
```

**Specialized Repositories**:

```csharp
// OrganizationRepository
public async Task<OrganizationDto> GetWithEmployeesAsync(int id)
{
    // Includes related employees for accurate counts
    return await _context.Organizations
        .Include(o => o.Employees)
        .FirstOrDefaultAsync(o => o.OrganizationId == id);
}

// UserRepository
public async Task<User> GetByEmailAsync(string email)
{
    return await _context.Users
        .FirstOrDefaultAsync(u => u.Email == email);
}

// AuditLogRepository
public async Task<IEnumerable<AuditLog>> GetByOrganizationAsync(int orgId)
{
    return await _context.AuditLogs
        .Where(a => a.OrganizationId == orgId)
        .OrderByDescending(a => a.Timestamp)
        .ToListAsync();
}
```

### Key Repository Methods

**Standard CRUD**:

```csharp
GetByIdAsync(id)              // Single entity with relationship loading
GetAllAsync()                 // All entities (with includes as needed)
AddAsync(entity)              // Create new entity
UpdateAsync(id, entity)       // Update existing entity
DeleteAsync(id)               // Delete entity (may cascade)
```

**Specialized Queries**:

```csharp
GetWithEmployeesAsync(orgId)  // Organization with full employee list
GetByEmailAsync(email)        // User lookup by email
GetByOrganizationAsync(orgId) // Filter entities by organization
GetByUserAsync(userId)        // Audit logs by user
```

## Configuration & Dependency Injection

### ServiceConfiguration.cs

Central configuration file for all Infrastructure services:

```csharp
public static IServiceCollection AddInfrastructureServices(
    this IServiceCollection services,
    IConfiguration configuration)
{
    // DbContext
    services.AddDbContext<ElectionVotingDbContext>(options =>
        options.UseSqlServer(
            configuration.GetConnectionString("DefaultConnection")));

    // Repositories
    services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IOrganizationRepository, OrganizationRepository>();
    // ... other repositories

    // Unit of Work
    services.AddScoped<IUnitOfWork, UnitOfWork>();

    // Application Services
    services.AddScoped<IAuthService, AuthService>();
    services.AddScoped<IOrganizationService, OrganizationService>();
    // ... other services

    return services;
}
```

### Call from Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Infrastructure setup
builder.Services.AddInfrastructureServices(builder.Configuration);

// ... rest of setup
```

## Data Model Overview

### Core Entities

**User** (Authentication & Authorization)

```csharp
public class User
{
    public int UserId { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public int RoleId { get; set; }
    public Role Role { get; set; }

    // For Manager/Employee users
    public int? OrganizationId { get; set; }
    public Organization Organization { get; set; }
}
```

**Organization** (Administrative Boundary)

```csharp
public class Organization
{
    public int OrganizationId { get; set; }
    public string OrganizationName { get; set; }
    public int TotalEmployeeCount { get; set; }

    public ICollection<Employee> Employees { get; set; }
    public ICollection<PollingStation> PollingStations { get; set; }
    public ICollection<AuditLog> AuditLogs { get; set; }
}
```

**Employee** (Organization Member)

```csharp
public class Employee
{
    public int EmployeeId { get; set; }
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
}
```

**PollingStation** (Physical Voting Location)

```csharp
public class PollingStation
{
    public int PollingStationId { get; set; }
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; }

    public string StationName { get; set; }
    public string Location { get; set; }
    public int VoterCapacity { get; set; }
}
```

**AuditLog** (Change Tracking)

```csharp
public class AuditLog
{
    public int AuditId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }

    public int? OrganizationId { get; set; }
    public Organization Organization { get; set; }

    public string EntityType { get; set; }       // "Organization", "Employee", etc.
    public int EntityId { get; set; }            // ID of changed entity
    public string Action { get; set; }           // "Create", "Update", "Delete"
    public string OldValues { get; set; }        // JSON before change
    public string NewValues { get; set; }        // JSON after change
    public DateTime Timestamp { get; set; }      // When change occurred
}
```

### Entity Relationships

```
User (1) ──────→ (Many) Employee
                         ↓
Organization (1) ←────────
                    │
                    └──→ (Many) PollingStation

AuditLog (Many) ──→ (1) User
                    (1) Organization
```

## Unit of Work Pattern

Coordinates multiple repositories in a single transaction:

```csharp
public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IOrganizationRepository Organizations { get; }
    IEmployeeRepository Employees { get; }
    // ... other repositories

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

**Usage in Services**:

```csharp
public async Task DeleteAsync(int orgId)
{
    var org = await _unitOfWork.Organizations.GetByIdAsync(orgId);

    // Get related data
    var employees = await _unitOfWork.Employees.GetByOrganizationAsync(orgId);

    // Delete in order: Employees → Users → Organization
    foreach (var emp in employees)
    {
        await _unitOfWork.Users.DeleteAsync(emp.User);
        await _unitOfWork.Employees.DeleteAsync(emp);
    }

    await _unitOfWork.Organizations.DeleteAsync(org);
    await _unitOfWork.SaveChangesAsync(); // Single commit
}
```

## Database Initialization

### DatabaseSeeder.cs

Populates initial data for development:

```csharp
public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<ElectionVotingDbContext>();

        if (context.Users.Any())
            return; // Already seeded

        // 1. Create roles
        var adminRole = new Role { RoleId = 1, RoleName = "SystemOwner", ... };
        await context.Roles.AddAsync(adminRole);

        // 2. Create default systemowner
        var adminUser = new User
        {
            Email = "admin@election.local",
            PasswordHash = BCrypt.HashPassword("..."),
            RoleId = 1
        };
        await context.Users.AddAsync(adminUser);

        // 3. Save
        await context.SaveChangesAsync();
    }
}
```

**Called from Program.cs**:

```csharp
await DatabaseSeeder.SeedAsync(app.Services);
app.Run();
```

## Connection Strings

### appsettings.json (Development)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ElectionVoting;Integrated Security=true;Encrypt=false;"
  }
}
```

### appsettings.Development.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=ElectionVoting_Dev;Integrated Security=true;"
  }
}
```

**Local SQL Server Setup**:

```bash
# Create database
dotnet ef database update

# Verify data
SELECT * FROM Users;
SELECT * FROM Organizations;
```

## Performance Considerations

### Query Optimization

**N+1 Problem Prevention**:

```csharp
// ❌ WRONG: N+1 query for each organization's employees
var orgs = _context.Organizations.ToList();
foreach(var org in orgs) {
    var emps = org.Employees; // Additional query per org
}

// ✅ RIGHT: Single query with Include
var orgs = await _context.Organizations.Include(o => o.Employees).ToListAsync();
```

**Indexes**:

```csharp
// Applied in DbContext.OnModelCreating
modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
modelBuilder.Entity<Employee>().HasIndex(e => e.OrganizationId);
modelBuilder.Entity<AuditLog>().HasIndex(a => a.Timestamp);
```

## Testing Strategy

**Unit Tests**: Mock DbContext, test repository logic

**Integration Tests**: Use real database

```csharp
[Fact]
public async Task CreateOrganization_WithValidData_ReturnsCreated()
{
    var org = new Organization { OrganizationName = "Test Org" };
    await _unitOfWork.Organizations.AddAsync(org);
    await _unitOfWork.SaveChangesAsync();

    var retrieved = await _unitOfWork.Organizations.GetByIdAsync(org.OrganizationId);
    Assert.NotNull(retrieved);
}
```

## Migrations Workflow

### Create a Migration

When domain models change:

```bash
cd backend\ElectionVoting.Infrastructure
dotnet ef migrations add AddNewColumn -v

# Creates: Migrations/{timestamp}_AddNewColumn.cs
```

### Review Migration

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "NewColumn",
        table: "Users",
        type: "nvarchar(100)",
        nullable: false);
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(name: "NewColumn", table: "Users");
}
```

### Apply to Database

```bash
dotnet ef database update

# Specific version
dotnet ef database update AddNewColumn

# Rollback one
dotnet ef database update PreviousMigration
```

## Build & Deployment

**Build**:

```bash
dotnet build
```

**Test**:

```bash
dotnet test ../ElectionVoting.Tests --filter Category=Integration
```

**Publish**:

```bash
dotnet publish -c Release
```

## Related Documentation

- **Domain Layer**: [../ElectionVoting.Domain/README.md](../ElectionVoting.Domain/README.md) - Entity definitions
- **Application**: [../ElectionVoting.Application/README.md](../ElectionVoting.Application/README.md) - Business logic
- **API Layer**: [../ElectionVoting.Api/README.md](../ElectionVoting.Api/README.md) - REST endpoints
- **Main Backend Guide**: [../README.md](../README.md)

## Contributing

When modifying data access:

1. **Update entity** in Domain layer
2. **Create migration**: `dotnet ef migrations add {name}`
3. **Review migration** SQL for correctness
4. **Update repository** specialized methods if needed
5. **Update DbContext** relationship configuration
6. **Add tests** for new repository methods
7. **Update DatabaseSeeder** if default data changes

## Troubleshooting

**"No database provider configured"**:

- Ensure AddDbContext is called in ServiceConfiguration
- Check connection string in appsettings.json

**"Pending migrations"**:

```bash
dotnet ef database update
```

**"Foreign key violation"**:

- Check cascade delete configuration
- Verify entity relationships in DbContext

## Maintenance Notes

**Last Updated**: Phase 6 - Documentation
**EF Core Version**: 10.0.5
**Database**: SQL Server (local development)
**Seeding**: Automatic on application startup
**Deployment Status**: Production-ready with Phase 5 hardening
