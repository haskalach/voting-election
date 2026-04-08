# ElectionVoting.Domain

**Domain Layer** - Core business entities, business rules, and domain contracts for the Election Voting System.

## Overview

The Domain layer contains the **heart of the business logic**: entity definitions, repository interfaces, business rules, and domain constraints. This layer has no external dependencies and is independent of frameworks, databases, and presentation technologies.

## Key Principles

- **Framework-agnostic**: No Entity Framework, ASP.NET Core, or external library dependencies
- **Immutable contracts**: Entities define structure; repositories/services define behavior
- **Business rules encoded**: Constraints, validations, and domain logic hardcoded in entities
- **Stability**: Changes rarely; other layers depend on these contracts

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│ Domain Layer (This project)                           │
│                                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Entities/                  Interfaces/            │ │
│ │ ├─ User                    ├─ IUserRepository    │ │
│ │ ├─ Organization            ├─ IRepository<T>    │ │
│ │ ├─ Employee                ├─ IUnitOfWork        │ │
│ │ ├─ Role                    └─ ...                │ │
│ │ ├─ PollingStation                               │ │
│ │ ├─ VoterAttendance                              │ │
│ │ ├─ VoteCount                                     │ │
│ │ ├─ AuditLog                                      │ │
│ │ └─ ...                                            │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ Constraints & Rules (encoded in properties, behaviors)│
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
         ↓ (Depended on by)
  Application & Infrastructure
```

## Directory Structure

```
├── Entities/                  # Core business entities
│   ├── User.cs
│   ├── Organization.cs
│   ├── Employee.cs
│   ├── Role.cs
│   ├── PollingStation.cs
│   ├── VoterAttendance.cs
│   ├── VoteCount.cs
│   └── AuditLog.cs
│
└── Interfaces/                # Repository & service contracts
    ├── IUserRepository.cs
    ├── IOrganizationRepository.cs
    ├── IEmployeeRepository.cs
    ├── IAuditLogRepository.cs
    ├── IRepository.cs (generic)
    └── IUnitOfWork.cs
```

## Core Entities

### User (Authentication & Authorization)

```csharp
public class User
{
    public int UserId { get; set; }

    // Credentials
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string PasswordHash { get; set; }  // BCrypt hash, never plain text

    // Role & Organization
    [Required]
    public int RoleId { get; set; }
    public Role Role { get; set; }

    // For non-SystemOwner roles
    public int? OrganizationId { get; set; }  // Null for SystemOwner
    public Organization Organization { get; set; }

    // Navigation
    public Employee Employee { get; set; }  // If user is an employee
    public ICollection<AuditLog> AuditLogs { get; set; }

    // Business Rules
    public bool IsActive { get; set; } = true;  // Soft delete support
}
```

**Business Rules**:

- Email is unique across the system
- PasswordHash is immutable after creation (no setters)
- OrganizationId is required for Manager/Employee, null for SystemOwner
- Password must be ≥8 characters (enforced in auth service)

### Organization (Administrative Boundary)

```csharp
public class Organization
{
    public int OrganizationId { get; set; }

    [Required]
    [MaxLength(200)]
    public string OrganizationName { get; set; }

    // Cached count for performance
    public int TotalEmployeeCount { get; set; }

    // Navigation
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<PollingStation> PollingStations { get; set; } = new List<PollingStation>();
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
```

**Business Rules**:

- OrganizationName is unique
- Must have at least one Manager
- When deleted, all Employees and PollingStations must be deleted (cascade)
- TotalEmployeeCount is refreshed on Updates for accuracy

### Employee (Organization Member)

```csharp
public class Employee
{
    public int EmployeeId { get; set; }

    // Organization Assignment
    [Required]
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; }

    // User Account
    [Required]
    public int UserId { get; set; }
    public User User { get; set; }

    // Personal Info
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; }

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    // Business Rules
    public bool IsActive { get; set; } = true;  // Soft delete

    // Navigation
    public ICollection<VoterAttendance> VoterAttendances { get; set; }
    public ICollection<VoteCount> VoteCounts { get; set; }
}
```

**Business Rules**:

- Must belong to exactly one Organization
- Must have linked User account for authentication
- Email is unique within the organization
- IsActive flag enables without-delete deactivation

### Role (Authorization)

```csharp
public class Role
{
    public int RoleId { get; set; }

    [Required]
    [MaxLength(50)]
    public string RoleName { get; set; }  // "SystemOwner", "Manager", "Employee"

    public ICollection<User> Users { get; set; }
}
```

**Built-in Roles**:
| Role | Description | Access |
|------|-------------|--------|
| **SystemOwner** | System administrator | All organizations, all functions |
| **Manager** | Organization manager | Own organization only, can create/delete employees |
| **Employee** | Elections staff | View own organization, log election data |

**No CRUD UI** for Roles; hardcoded in database seeding.

### PollingStation (Physical Voting Location)

```csharp
public class PollingStation
{
    public int PollingStationId { get; set; }

    // Organization Assignment
    [Required]
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; }

    // Location Details
    [Required]
    [MaxLength(200)]
    public string StationName { get; set; }  // "Station A", "Downtown Library", etc.

    [Required]
    [MaxLength(500)]
    public string Location { get; set; }  // Address or landmark

    // Capacity Planning
    [Range(1, 10000)]
    public int VoterCapacity { get; set; }  // Max voters this location can handle

    // Navigation
    public ICollection<VoterAttendance> VoterAttendances { get; set; }
    public ICollection<VoteCount> VoteCounts { get; set; }
}
```

**Business Rules**:

- Must belong to exactly one Organization
- StationName and Location are organization-scoped (can repeat across orgs)
- VoterCapacity must be positive integer

### VoterAttendance (Election Day Data)

```csharp
public class VoterAttendance
{
    public int AttendanceId { get; set; }

    // Recording Employee & Location
    [Required]
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; }

    [Required]
    public int PollingStationId { get; set; }
    public PollingStation PollingStation { get; set; }

    // Voter Info
    [Required]
    [MaxLength(20)]
    public string VoterId { get; set; }  // Voter ID card number

    // Timestamp & Notes
    [Required]
    public DateTime AttendanceTime { get; set; }

    [MaxLength(500)]
    public string Notes { get; set; }  // Optional notes from election worker
}
```

**Business Rules**:

- VoterId must be unique per PollingStation (prevent double-voting at same location)
- AttendanceTime should be on election day
- Logged by Employee at specific PollingStation

### VoteCount (Election Results)

```csharp
public class VoteCount
{
    public int VoteCountId { get; set; }

    // Recording Data
    [Required]
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; }

    [Required]
    public int PollingStationId { get; set; }
    public PollingStation PollingStation { get; set; }

    // Vote Tallies
    [Range(0, int.MaxValue)]
    public int TotalVotes { get; set; }

    [MaxLength(1000)]
    public string CandidateTallies { get; set; }  // JSON: {"candidate": count, ...}

    // Timestamp
    [Required]
    public DateTime RecordedTime { get; set; }
}
```

**Business Rules**:

- CandidateTallies stored as JSON string
- Can be updated if election officials correct tallies
- Recorded, not from official ballot box (audit trail important)

### AuditLog (Change Tracking)

```csharp
public class AuditLog
{
    public int AuditId { get; set; }

    // Who Made Change
    [Required]
    public int UserId { get; set; }
    public User User { get; set; }

    // Where Change Happened
    public int? OrganizationId { get; set; }  // Org where change occurred (null for system-level)
    public Organization Organization { get; set; }

    // What Changed
    [Required]
    [MaxLength(100)]
    public string EntityType { get; set; }  // "Organization", "Employee", "PollingStation"

    [Required]
    public int EntityId { get; set; }  // ID of changed entity

    [Required]
    [MaxLength(20)]
    public string Action { get; set; }  // "Create", "Update", "Delete"

    // Change Details
    public string OldValues { get; set; }  // JSON before change (null for Create)
    public string NewValues { get; set; }  // JSON after change

    // When
    [Required]
    public DateTime Timestamp { get; set; }
}
```

**Business Rules**:

- Audit entries are **immutable** (no updates after creation)
- OldValues is null for Create actions
- NewValues is null for Delete actions
- Created automatically by interceptors/middlewares
- Queries filtered by OrganizationId for Manager access control

## Repository Interfaces

Contracts that Infrastructure layer implements. Define _how_ to access data without specifying database mechanics.

### IRepository<T> (Generic)

```csharp
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}
```

**Purpose**: Base contract for all entity operations

### IUserRepository

```csharp
public interface IUserRepository : IRepository<User>
{
    Task<User> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<User>> GetByOrganizationAsync(int organizationId);
}
```

**Specialized queries**: Email lookup, uniqueness checks, org filtering

### IOrganizationRepository

```csharp
public interface IOrganizationRepository : IRepository<Organization>
{
    Task<Organization> GetWithEmployeesAsync(int id);  // Include employees
    Task<IEnumerable<Organization>> GetWithEmployeeCountsAsync();
    Task<bool> NameExistsAsync(string name);
}
```

**Specialized queries**: Eager loading optimizations, count calculations

### IEmployeeRepository

```csharp
public interface IEmployeeRepository : IRepository<Employee>
{
    Task<IEnumerable<Employee>> GetByOrganizationAsync(int organizationId);
    Task<Employee> GetWithUserAsync(int employeeId);
    Task<IEnumerable<Employee>> GetActiveByOrganizationAsync(int organizationId);
}
```

**Specialized queries**: Org filtering, active-only results, user relationship loading

### IAuditLogRepository

```csharp
public interface IAuditLogRepository : IRepository<AuditLog>
{
    Task<IEnumerable<AuditLog>> GetByOrganizationAsync(int organizationId);
    Task<IEnumerable<AuditLog>> GetByUserAsync(int userId);
    Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityType, int entityId);
    Task<IEnumerable<AuditLog>> GetRecentAsync(int count);
}
```

**Specialized queries**: Filtering by org/user/entity, time-based retrieval

### IUnitOfWork (Transaction Boundary)

```csharp
public interface IUnitOfWork : IDisposable
{
    // Repository properties
    IUserRepository Users { get; }
    IOrganizationRepository Organizations { get; }
    IEmployeeRepository Employees { get; }
    IPollingStationRepository PollingStations { get; }
    IAuditLogRepository AuditLogs { get; }

    // Transaction control
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

**Purpose**: Coordinates multiple repositories; ensures all-or-nothing persistence

## Dependency Rules

### What Domain CAN depend on:

- ✅ Standard C# libraries (System.\*, etc.)
- ✅ Entity Framework Core types (for attributes)
- ✅ Other domain entities and interfaces

### What Domain CANNOT depend on:

- ❌ ASP.NET Core (no Controllers, Middleware, etc.)
- ❌ Application layer (no DTOs, services)
- ❌ Infrastructure (no DbContext, repositories)
- ❌ External libraries (no EF Core implementations, logging, etc.)

**Why?** Domain is pure business logic; stays stable and portable.

## Business Rules & Constants

### Validation Rules

**Email**:

- Must be valid email format
- Must be unique in Users table
- Maximum 255 characters

**Organization Name**:

- Required, 1-200 characters
- Must be unique

**Employee**:

- FirstName, LastName: 1-100 characters each
- Email: Must match domain email pattern
- Must belong to exactly one Organization

**Passwords**:

- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 digit
- Never stored in plain text (always BCrypt hash)

### Role Permissions Matrix

```
                  |SystemOwner| Manager | Employee |
==================|============|=========|==========|
View all orgs     |      ✓     |    ✗    |    ✗    |
Manage orgs       |      ✓     |    ✗    |    ✗    |
View own org      |      ✓     |    ✓    |    ✓    |
Manage own org    |      ✓     |    ✓    |    ✗    |
Create employees  |      ✓     |    ✓    |    ✗    |
View audit logs   |      ✓     |    ✓*   |    ✗    |
Record data       |      ✗     |    ✗    |    ✓    |
```

\* Manager sees only own organization's audit logs

## Entity State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Entity Lifecycle                          │
│                                                              │
│  New              Tracked            Modified       Deleted  │
│   │                  │                   │           │       │
│   └─────→ Create ────→ SaveChanges ─────→ Update ───→        │
│            (Insert)       (Commit)                 │         │
│                                                    │         │
│   ┌────────────────────────────────────────────────┘         │
│   │                                                          │
│   └─→ Delete (entity hard-deleted from database)            │
│                                                              │
│   Alternative: Soft Delete (IsActive = false)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Testing Strategy

**No dependencies needed**: Domain entities can be tested directly.

```csharp
[Fact]
public void User_WithValidEmail_IsValid()
{
    var user = new User
    {
        Email = "test@example.com",
        PasswordHash = "hashed",
        RoleId = 1,
        OrganizationId = null  // SystemOwner
    };

    Assert.NotNull(user.Email);
    Assert.True(user.IsActive);
}

[Fact]
public void Employee_MustBelongToOrganization()
{
    var employee = new Employee
    {
        FirstName = "John",
        LastName = "Doe",
        Email = "john@org.local",
        OrganizationId = 1,
        UserId = 1
    };

    Assert.NotEqual(0, employee.OrganizationId);
}
```

## Build & Usage

**Build**:

```bash
dotnet build
```

**Reference from other projects**:

```xml
<ProjectReference Include="../ElectionVoting.Domain/ElectionVoting.Domain.csproj" />
```

## Related Documentation

- **Infrastructure**: [../ElectionVoting.Infrastructure/README.md](../ElectionVoting.Infrastructure/README.md) - Repository implementations
- **Application**: [../ElectionVoting.Application/README.md](../ElectionVoting.Application/README.md) - Service implementations
- **API Layer**: [../ElectionVoting.Api/README.md](../ElectionVoting.Api/README.md) - REST endpoints
- **Main Backend Guide**: [../README.md](../README.md)

## Contributing

When adding new entities:

1. **Define in Domain**: Create entity class with properties and navigation
2. **Add interface**: Create IXyzRepository interface
3. **Update IUnitOfWork**: Add property for new repository
4. **Implement in Infrastructure**: Create concrete repository
5. **Register DI**: Add to ServiceConfiguration
6. **Create migration**: `dotnet ef migrations add {description}`
7. **Update DbContext**: Configure entity mappings
8. **Add tests**: Unit test the entity behavior
9. **Document**: Update this README with new entity details

## Maintenance Notes

**Last Updated**: Phase 6 - Documentation
**Stability**: Core layer, rarely changes
**Test Coverage**: 100+ unit tests
**Deployment Status**: Production-ready
