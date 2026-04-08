# ElectionVoting.Application

**Application Layer** - Business logic and service implementations for the Election Voting System.

## Overview

The Application layer contains all business logic, use cases, and service implementations. It sits between the API layer (inbound presentations) and the Infrastructure layer (data access). This layer is domain-agnostic and can be reused across different presentation technologies (Web, Mobile, CLI, etc.).

## Key Responsibilities

- **Business logic orchestration**: Coordinate domain entities and repositories to implement use cases
- **Data transformation**: DTOs that decouple API contracts from domain models
- **Service interface definitions**: Contracts that API controllers and other clients depend on
- **Validation and error handling**: Apply business rules before data persistence
- **Audit and logging integration**: Track changes through the system

## Architecture & Dependencies

```
API Layer (calls)
    ↓
Application Layer (this)
    ↓
Domain Layer (depends on)
    ↓
Infrastructure Layer (queries)
    ↓
Database
```

### Dependency Injection

Register all Application services in `ElectionVoting.Infrastructure.ServiceConfiguration.cs`:

```csharp
builder.Services.AddApplicationServices();
```

## Directory Structure

### `/DTOs` - Data Transfer Objects

Lightweight data containers that represent communication boundaries:

```
├── AuthDtos.cs              # Login, Register, Refresh, Token responses
├── OrganizationDtos.cs      # Organization CRUD contracts
├── EmployeeDtos.cs          # Employee management contracts
├── PollingStationDtos.cs    # Polling station contracts
├── DashboardDtos.cs         # Analytics and reporting DTOs
└── DataDtos.cs              # Election day data (attendance, votes)
```

**Pattern**: Record types with DataAnnotations [Required], [EmailAddress], [MinLength], etc.

**Best Practice**: DTOs enable API versioning without domain model changes.

### `/Services` - Business Logic Implementation

Stateless services implementing IServiceInterface contracts:

```
├── AuthService.cs           # JWT token generation, authentication
├── OrganizationService.cs   # Org CRUD with cascade deletes
├── EmployeeService.cs       # Employee lifecycle management
├── PollingStationService.cs # Polling station administration
├── DashboardService.cs      # Election analytics and metrics
└── DataService.cs           # Election day data recording
```

**Key Service Features**:

- **Dependency injection**: Repository and service dependencies
- **Transaction management**: Uses EF Core DbContext operations
- **Cascade operations**: DeleteAsync triggers cascading deletes
- **Audit integration**: Creates records via IUnitOfWork
- **Exception handling**: Throws business exceptions for API handlers

### `/Interfaces` - Service Contracts

Interface definitions that services implement:

```
├── IAuthService.cs          # Authentication contract
├── IOrganizationService.cs  # Organization ops contract
├── IEmployeeService.cs      # Employee lifecycle contract
├── IPollingStationService.cs# Station management contract
├── IDashboardService.cs     # Analytics contract
└── IDataService.cs          # Data recording contract
```

**Documentation**: All interfaces include XML comments detailing:

- Method behavior and responsibility
- Parameter descriptions with business meaning
- Return value semantics
- Possible exceptions and error conditions
- Audit and validation notes

## Core Services Reference

### AuthService (IAuthService)

```csharp
LoginAsync(LoginRequestDto)       // JWT generation from credentials
RefreshTokenAsync(refreshToken)   // Token renewal
RegisterAsync(RegisterRequestDto) // New SystemOwner registration
LogoutAsync(userId)               // Session termination
```

**Security Features**:

- Password validation against domain constraints
- JWT tokens with issuer/audience/lifetime validation
- Refresh token rotation on each use
- Rate limiting on auth endpoints (enforced in API layer)

### OrganizationService (IOrganizationService)

```csharp
GetAllAsync()                      // All organizations (org summary)
GetByIdAsync(id)                   // Specific org (full details + employees)
CreateAsync(dto, createdByUserId)  // New org with initial manager
UpdateAsync(id, dto)               // Update org info, refresh employee count
DeleteAsync(id)                    // Delete org + employees + users (cascade)
```

**Business Rules**:

- CreateAsync triggers User creation for org manager
- UpdateAsync uses GetWithEmployeesAsync() to recalculate counts
- DeleteAsync cascade: Organization → Employees → Users
- Manager access isolation (can only view/update own org)

### EmployeeService (IEmployeeService)

```csharp
GetByOrganizationAsync(orgId)      // All active employees
GetByIdAsync(empId)                // Specific employee
CreateAsync(orgId, dto, supervisedByUserId)  // New employee + user
UpdateAsync(empId, dto)            // Update employee info
DeactivateAsync(empId)             // Soft delete (keeps audit history)
DeleteAsync(empId)                 // Hard delete (removes employee + user)
```

**Business Rules**:

- CreateAsync creates linked User account automatically
- DeleteAsync cascades to User deletion
- Deactivation preserves audit trail for compliance

### PollingStationService (IPollingStationService)

```csharp
GetByOrganizationAsync(orgId)      // All active stations in org
GetByIdAsync(id)                   // Specific station
CreateAsync(orgId, dto)            // New polling location
UpdateAsync(id, dto)               // Update station info
DeleteAsync(id)                    // Remove station
```

**Features**:

- Supports geographic distribution planning
- Capacity tracking for voter access
- Organization isolation (cross-org access denied)

### DataService (IDataService)

```csharp
LogAttendanceAsync(empId, dto)     // Record voter arrival
GetAttendanceByEmployeeAsync(empId)// Employee's processed voters
GetAttendanceByOrganizationAsync(orgId) // Org voter roster
LogVoteCountAsync(empId, dto)      // Record vote tally
GetVoteCountsByEmployeeAsync(empId)// Employee's vote counts
GetVoteCountsByOrganizationAsync(orgId) // Org election results
```

**Features**:

- Election day operational data collection
- Duplicate detection (same voter at same location)
- Results aggregation by organization
- Audit logging on data changes

### DashboardService (IDashboardService)

```csharp
GetOrganizationDashboardAsync(orgId)    // Org-specific metrics
GetSystemDashboardAsync()                // System-wide analytics
```

**Metrics**:

- Voter participation rates
- Polling station distribution
- Employee activity summaries
- Vote count validation (attendance vs. votes)

## Error Handling Strategy

Services throw **domain-specific exceptions** that API layer transforms:

```csharp
throw new KeyNotFoundException("Organization not found");
throw new InvalidOperationException("Duplicate organization name");
throw new UnauthorizedAccessException("Invalid credentials");
```

**API Handler**: `catch (KeyNotFoundException)` → `return NotFound()`

**Pattern**: Let application layer raise exceptions; API layer handles translations.

## Data Annotations & Validation

All DTOs include validation attributes:

```csharp
public record LoginRequestDto(
    [Required][EmailAddress] string Email,
    [Required][MinLength(8)] string Password
);
```

**Applied Attributes**:

- [Required] - Non-nullable fields
- [EmailAddress] - Email format validation
- [MinLength(n)] - Minimum string length
- [MaxLength(n)] - Maximum string length
- [Phone] - Phone number format
- [Range(min, max)] - Numeric bounds

**Validation Location**: API layer performs ModelState validation before service calls.

## Dependency Graph

```
(External Dependencies)
           ↑
ElectionVoting.Domain (Entities, Interfaces)
           ↑
ElectionVoting.Infrastructure (Repositories, DbContext)
           ↑
ElectionVoting.Application (This project) ← NO external dependencies
           ↑
ElectionVoting.Api (Controllers, Middleware)
```

**Why**: Application layer depends DOWN the stack (Infra + Domain), never UP (API).

## Testing Strategy

**Unit Tests** (ElectionVoting.Tests):

- Mock IRepositories
- Test service business logic
- Verify exception handling
- Assert DTO transformations

**Integration Tests**:

- Use real DbContext
- Test service + repository interaction
- Verify cascade operations
- Check audit trail creation

## Best Practices

### 1. Thin Controllers, Fat Services

**Controllers**: Route → Auth → Service → Response

**Services**: Business logic, validation, orchestration

### 2. Separate Concerns

**Never put** in services:

- HTTP status codes (API layer responsibility)
- Route handling (controller responsibility)
- Database queries (repository responsibility)

### 3. Immutable DTOs

```csharp
public record CreateOrganizationDto(
    [Required] string OrganizationName,
    [Required][EmailAddress] string ManagerEmail,
    [Required] string AdminFirstName,
    [Required] string AdminLastName
);
```

Records are immutable and provide data-level equality.

### 4. XML Documentation

```csharp
/// <summary>Creates new organization with initial manager</summary>
/// <param name="dto">Organization creation data</param>
/// <param name="createdByUserId">User creating the org (audit trail)</param>
/// <returns>Newly created organization</returns>
/// <exception cref="InvalidOperationException">Duplicate org name</exception>
public async Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto, int createdByUserId)
```

## Build & Testing

**Build**:

```bash
dotnet build
```

**Test**:

```bash
dotnet test ../ElectionVoting.Tests
```

**Run Locally**:
Services are tested via API endpoints; see ../ElectionVoting.Api/README.md

## Related Documentation

- **Domain Layer**: [../ElectionVoting.Domain/README.md](../ElectionVoting.Domain/README.md) - Entity definitions
- **Infrastructure**: [../ElectionVoting.Infrastructure/README.md](../ElectionVoting.Infrastructure/README.md) - Data access
- **API Layer**: [../ElectionVoting.Api/README.md](../ElectionVoting.Api/README.md) - REST endpoints
- **Main Backend Guide**: [../README.md](../README.md)

## Contributing

When adding new services:

1. **Define interface** in `/Interfaces` with full XML documentation
2. **Implement service** in `/Services` with business logic
3. **Create DTOs** in `/DTOs` with validation attributes
4. **Register DI** in Infrastructure.ServiceConfiguration
5. **Add controller endpoints** in API layer
6. **Write unit tests** in ElectionVoting.Tests project
7. **Document exceptions** in XML comments

## Maintenance Notes

**Last Updated**: Phase 6 - Documentation
**Test Coverage**: 175+ unit and integration tests
**Deployment Status**: Production-ready with Phase 5 security hardening
