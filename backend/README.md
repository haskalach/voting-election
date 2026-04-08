# Election Voting Supervision System — Backend

**Status**: ✅ Phase 5 Complete — Security & RBAC Fixes  
**Last Updated**: April 8, 2026  
**Framework**: .NET 10, ASP.NET Core, Entity Framework Core

---

## 📋 Overview

The backend is a layered .NET 10 API that provides:

- **Authentication & Access Control**: JWT-based auth with refresh tokens, rate limiting
- **Role-Based Access Control (RBAC)**: SystemOwner → Manager → Employee hierarchy
- **Organization Management**: Multi-tenant support with organization isolation
- **Election Data Tracking**: Voter attendance, vote counts, polling station management
- **Audit Logging**: Comprehensive audit trail of all sensitive operations

---

## 🏗️ Architecture

### Layered Design

```
API Layer (Controllers)
    ↓
Application Layer (Services, DTOs)
    ↓
Domain Layer (Entities, Interfaces)
    ↓
Infrastructure Layer (Database, Repositories)
```

### Projects

| Project                           | Purpose                                     |
| --------------------------------- | ------------------------------------------- |
| **ElectionVoting.Api**            | ASP.NET Core web API, Swagger/OpenAPI       |
| **ElectionVoting.Application**    | Business logic (services, DTOs, interfaces) |
| **ElectionVoting.Domain**         | Domain entities, business rules             |
| **ElectionVoting.Infrastructure** | Data access, EF Core context, repositories  |
| **ElectionVoting.Tests**          | Unit & integration tests (175 tests)        |

---

## 🔐 Security Features

### Phase 5 Fixes Applied

1. **Secrets Management**: Moved hardcoded secrets to `.Development.json`
2. **Token Storage**: JWT access token in-memory (ONLY), refresh token in secure storage
3. **Rate Limiting**: 10 requests/minute on auth endpoints
4. **Authorization Checks**: Organization ownership verification on all mutations
5. **Input Validation**: DataAnnotations on all DTO fields

### Authentication Flow

```
1. Login (POST /api/auth/login)
   → Email/password validation
   → Returns: accessToken + refreshToken + user

2. Access protected endpoint with Authorization header
   → Bearer {accessToken} validated
   → User context extracted from JWT claims

3. Token expires → Use refreshToken
   → POST /api/auth/refresh
   → Returns: new accessToken (old token revoked)

4. Logout
   → All refresh tokens for user revoked
```

### Role-Based Access (RBAC)

| Role            | Permissions                                                         |
| --------------- | ------------------------------------------------------------------- |
| **SystemOwner** | Full system access, org creation, user reg, system dashboard        |
| **Manager**     | Manage own organization, employees, polling stations, own dashboard |
| **Employee**    | View/record attendance & votes for assigned stations                |

---

## 🗄️ Data Model

### Core Entities

- **User**: Login account (email, password, role, organization)
- **Organization**: Election organization (name, party, contact info)
- **Employee**: Org staff member (user + department info)
- **PollingStation**: Voting location (name, address, organization)
- **VoterAttendance**: Records voter turnout at stations
- **VoteCount**: Records vote tallies per candidate
- **AuditLog**: Tracks all sensitive operations

### Relationships

```
User ──────┐
           ├──→ Organization (many-to-many)
           └──→ Employee (one-to-many)
               └──→ PollingStation (many-to-many)
                   ├──→ VoterAttendance
                   └──→ VoteCount
```

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` — Authenticate user (rate limited)
- `POST /api/auth/register` — Register new user (SystemOwner only)
- `POST /api/auth/refresh` — Refresh expired token (rate limited)
- `POST /api/auth/logout` — Revoke all tokens

### Dashboard

- `GET /api/dashboard/organization/{orgId}` — Organization metrics (Manager+)
- `GET /api/dashboard/system` — System-wide metrics (SystemOwner only)

### Organizations

- `GET /api/organizations` — List all (Manager+)
- `GET /api/organizations/{id}` — Get details (Manager+)
- `POST /api/organizations` — Create org (SystemOwner only)
- `PUT /api/organizations/{id}` — Update own org (Manager)
- `DELETE /api/organizations/{id}` — Delete org (SystemOwner only)

### Employees

- `GET /api/organizations/{orgId}/employees` — List org employees
- `GET /api/organizations/{orgId}/employees/{empId}` — Get employee
- `POST /api/organizations/{orgId}/employees` — Create employee
- `PUT /api/organizations/{orgId}/employees/{empId}` — Update employee
- `DELETE /api/organizations/{orgId}/employees/{empId}` — Delete employee

### Polling Stations

- `GET /api/organizations/{orgId}/polling-stations` — List stations
- `GET /api/organizations/{orgId}/polling-stations/{id}` — Get station
- `POST /api/organizations/{orgId}/polling-stations` — Create station
- `PUT /api/organizations/{orgId}/polling-stations/{id}` — Update station
- `DELETE /api/organizations/{orgId}/polling-stations/{id}` — Delete station

### Data Recording

- `POST /api/data/attendance` — Log voter attendance
- `POST /api/data/votes` — Log vote counts

### Audit

- `GET /api/audit-logs` — View audit trail

See **Swagger UI** at `/swagger` for complete interactive documentation.

---

## 🛠️ Development Setup

### Prerequisites

- .NET 10 SDK
- SQL Server (local or container)
- Visual Studio 2024 or VS Code

### Configuration

Edit `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ElectionVoting;Trusted_Connection=true;"
  },
  "Jwt": {
    "Secret": "your-min-32-char-secret-key"
  },
  "Seed": {
    "OwnerPassword": "Admin@12345"
  }
}
```

### Running

```bash
# Build
cd backend/ElectionVoting.Api
dotnet build

# Run with auto-migrations and seed
dotnet run
# API available at: http://localhost:5001
# Swagger UI: http://localhost:5001/swagger

# Run tests
cd ../ElectionVoting.Tests
dotnet test

# Watch for changes
dotnet watch run
```

---

## 📦 Key Dependencies

| Package                                         | Purpose                       |
| ----------------------------------------------- | ----------------------------- |
| `Microsoft.EntityFrameworkCore`                 | ORM & migrations              |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT token validation          |
| `Microsoft.AspNetCore.RateLimiting`             | Request rate limiting         |
| `Swashbuckle.AspNetCore`                        | OpenAPI/Swagger documentation |
| `BCrypt.Net`                                    | Password hashing              |
| `Mapster`                                       | Object mapping                |

---

## 🧪 Testing

### Test Suite Summary

- **Total**: 175 tests
- **Status**: ✅ All passing
- **Coverage**: Auth, RBAC, services, repositories, integration

### Running Tests

```bash
dotnet test                      # Run all
dotnet test --filter "Auth"      # Run category
dotnet test --verbose            # Detailed output
```

### Test Projects

- `AuthServiceTests.cs` — Authentication logic
- `ControllerTests.cs` — API endpoint authorization
- `RepositoryIntegrationTests.cs` — Data access layer
- `DashboardServiceTests.cs` — Analytics calculations
- `Phase4BasicTests.cs` — Functional scenarios

---

## 📝 Code Standards

### Naming

- Controllers: `{Resource}Controller` (e.g., `AuthController`)
- Services: `I{Resource}Service` interface + `{Resource}Service` implementation
- DTOs: `{Action}{Resource}Dto` (e.g., `CreateOrganizationDto`)
- Repositories: `I{Resource}Repository`

### XML Documentation

All public methods documented with:

```csharp
/// <summary>Brief description</summary>
/// <param name="name">Parameter description</param>
/// <returns>Return value description</returns>
/// <response code="200">Success response</response>
```

### Error Handling

- Controller: Catch exceptions, return appropriate HTTP status
- Service: Throw domain exceptions (`InvalidOperationException`, `KeyNotFoundException`, `UnauthorizedAccessException`)
- Repository: No exception handling (let higher layers decide)

---

## 🔄 Recent Changes (Phase 5)

### Security Hardening

✅ Removed secrets from repo  
✅ JWT token moved out of localStorage  
✅ Rate limiting on auth endpoints

### Authorization

✅ Organization ownership checks  
✅ Manager can only access own org  
✅ Employee/Station endpoint org verification

### Data Integrity

✅ Orphaned user cleanup on org deletion  
✅ Fixed employee count bug  
✅ Input validation on all DTOs

---

## 🚀 Deployment

### Environment Configuration

Set these for production:

```json
{
  "Jwt:Secret": "production-secret-from-vault",
  "Seed:OwnerPassword": "strong-password-from-vault",
  "ConnectionStrings:DefaultConnection": "prod-sql-server",
  "AllowedHosts": "yourdomain.com"
}
```

### Database Migrations

```bash
dotnet ef migrations add {Name}
dotnet ef database update
```

---

## 📚 Related Documentation

- [API Design docs](../../docs/tech_design_res.md)
- [Database ERD](../../docs/diagrams/02-database-erd.mmd)
- [Auth Flow](../../docs/diagrams/03-auth-flow.mmd)
- [RBAC Design](../../docs/diagrams/04-rbac-flow.mmd)

---

## 🔗 Quick Links

- [Main README](../../README.md)
- [Frontend Services Documentation](../frontend/README.md)
- [Phase 5 Code Review Results](../../PHASE_5_CODE_REVIEW.md)
- [All Phases Log](../../)

---

**Maintained by**: Dev Team  
**Last Review**: Apr 8, 2026
