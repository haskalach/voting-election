# Phase 5: Code Review — Security, Design & Business Logic

**Date**: April 8, 2026  
**Scope**: Full-stack review — Backend (.NET 10) + Frontend (Angular 18)  
**Status**: 🔴 Findings documented, fixes pending

---

## Summary of Findings

| Severity    | Count | Category                        |
| ----------- | ----- | ------------------------------- |
| 🔴 Critical | 3     | Security / Auth                 |
| 🟠 High     | 5     | Authorization / RBAC            |
| 🟡 Medium   | 6     | Business Logic / Data Integrity |
| 🔵 Low      | 5     | Design / Code Quality           |

---

## 🔴 Critical — Security

---

### CR-01: Secrets Committed to Source Control

**File**: `backend/ElectionVoting.Api/appsettings.json`

**Problem**: The JWT secret and seed admin password are hardcoded in a committed file:

```json
"Secret": "your-super-secret-jwt-key-at-least-32-characters-long-change-in-production",
"OwnerPassword": "Admin@12345"
```

The `.gitignore` only excludes `appsettings.Development.json` and `appsettings.*.local.json`, so `appsettings.json` is tracked.

**Fix**: Move secrets to environment variables or `appsettings.Production.json` (gitignored). Use .NET User Secrets for local development:

```bash
dotnet user-secrets set "Jwt:Secret" "<strong-random-secret>"
dotnet user-secrets set "Seed:OwnerPassword" "<secure-password>"
```

Add `appsettings.Production.json` to `.gitignore`. Keep only placeholder values in the committed file.

---

### CR-02: JWT + Refresh Tokens Stored in localStorage (XSS Risk)

**File**: `frontend/election-voting-ui/src/app/core/services/auth.service.ts`

**Problem**: All tokens are in `localStorage`, which is fully accessible to any JavaScript on the page — including injected scripts:

```typescript
localStorage.setItem(this.TOKEN_KEY, response.accessToken);
localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
```

**Fix**: Store the short-lived access token in memory (a service signal), and store only the refresh token in an `httpOnly` cookie set by the server. This prevents XSS from ever reading the refresh token. At minimum, if localStorage must be used, the refresh token should be in a `Secure; SameSite=Strict` cookie.

---

### CR-03: No Rate Limiting on Authentication Endpoints

**File**: `backend/ElectionVoting.Api/Controllers/AuthController.cs` / `Program.cs`

**Problem**: `POST /api/auth/login` and `POST /api/auth/refresh` have no rate limiting. This exposes the API to brute-force and credential-stuffing attacks.

**Fix**: Add ASP.NET Core rate limiting middleware:

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", o =>
    {
        o.PermitLimit = 10;
        o.Window = TimeSpan.FromMinutes(1);
    });
});
// Then on the controller:
[EnableRateLimiting("auth")]
```

---

## 🟠 High — Authorization / RBAC

---

### CR-04: Manager Can View Any Organization's Dashboard

**File**: `backend/ElectionVoting.Api/Controllers/DashboardController.cs`

**Problem**: `GET /api/dashboard/organization/{orgId}` is authorized for `Manager` but does not verify the Manager belongs to the requested org. Any Manager can query any organization's data.

```csharp
[Authorize(Roles = "SystemOwner,Manager")]
public async Task<ActionResult<DashboardDto>> GetOrganizationDashboard(int orgId)
    => Ok(await _dashService.GetOrganizationDashboardAsync(orgId)); // no ownership check
```

**Fix**: Extract `organizationId` from the JWT claim and verify it matches `orgId`:

```csharp
var orgIdClaim = User.FindFirst("organizationId");
if (_user()?.role === 'Manager' && orgIdClaim?.Value != orgId.ToString())
    return Forbid();
```

---

### CR-05: Manager Can Update Any Organization

**File**: `backend/ElectionVoting.Api/Controllers/OrganizationsController.cs`

**Problem**: `PUT /api/organizations/{id}` is accessible to any Manager — not just the Manager who owns that org:

```csharp
[Authorize(Roles = "SystemOwner,Manager")]
public async Task<ActionResult<OrganizationDto>> Update(int id, ...)
```

**Fix**: Same pattern as CR-04 — check the `organizationId` claim matches `id` when the caller's role is `Manager`.

---

### CR-06: Organization List/Detail Accessible to Employees

**File**: `backend/ElectionVoting.Api/Controllers/OrganizationsController.cs`

**Problem**: `GET /api/organizations` and `GET /api/organizations/{id}` are gated only by `[Authorize]` — any authenticated Employee can enumerate all organizations and their details.

**Fix**: Restrict to `SystemOwner,Manager` or scope Employee access to their own organization only.

---

### CR-07: Employee/PollingStation Endpoints Have No Org Ownership Check

**Files**: `EmployeesController.cs`, `PollingStationsController.cs`

**Problem**: Routes like `GET /api/organizations/{orgId}/employees` trust the `orgId` in the URL but never verify the authenticated Manager actually belongs to that organization.

**Fix**: In each action, compare the `organizationId` JWT claim to the route `orgId`.

---

### CR-08: Concurrent Token Refresh Race Condition

**File**: `frontend/election-voting-ui/src/app/core/interceptors/jwt.interceptor.ts`

**Problem**: If multiple HTTP requests fail with 401 simultaneously, each triggers an independent `refreshToken()` call. The first refresh revokes the old token; subsequent ones fail, causing the user to be logged out unexpectedly.

**Fix**: Use a shared observable with `shareReplay(1)` and a refresh-in-progress flag:

```typescript
let refreshInProgress$: Observable<RefreshTokenResponse> | null = null;

// In the 401 handler:
if (!refreshInProgress$) {
  refreshInProgress$ = auth.refreshToken().pipe(
    shareReplay(1),
    finalize(() => refreshInProgress$ = null)
  );
}
return refreshInProgress$.pipe(switchMap(...));
```

---

## 🟡 Medium — Business Logic / Data Integrity

---

### CR-09: Organization Admin Created with Hardcoded Name

**File**: `backend/ElectionVoting.Application/Services/OrganizationService.cs` (line ~57)

**Problem**: The admin user created for a new organization always gets `FirstName = "Organization"`, `LastName = "Admin"` regardless of the DTO values:

```csharp
var adminUser = new User
{
    FirstName = "Organization",   // hardcoded
    LastName = "Admin",           // hardcoded
    ...
};
```

**Fix**: Add `AdminFirstName` and `AdminLastName` to `CreateOrganizationDto`, or at minimum accept them as parameters and populate the `User` entity accordingly.

---

### CR-10: DeleteOrganization Leaves Orphaned User Accounts

**File**: `backend/ElectionVoting.Application/Services/OrganizationService.cs`

**Problem**: `DeleteAsync` removes `Employee` records but not their associated `User` accounts. This leaves login-capable User rows in the database with no organizational context:

```csharp
foreach (var employee in org.Employees.ToList())
    await _employeeRepository.DeleteAsync(employee); // User row NOT deleted
```

**Fix**: For each employee, also delete the associated User:

```csharp
var user = await _userRepository.GetByIdAsync(employee.UserId);
if (user != null) await _userRepository.DeleteAsync(user);
```

Or configure EF Core cascade delete on the `Employee → User` relationship.

---

### CR-11: UpdateOrganization Returns Wrong Employee Count

**File**: `backend/ElectionVoting.Application/Services/OrganizationService.cs`

**Problem**: `UpdateAsync` fetches the org via `GetByIdAsync` (no `Include`), then calls `MapToDto(org)` which accesses `o.Employees.Count`. Since employees are not loaded, this will always return 0:

```csharp
var org = await _orgRepository.GetByIdAsync(id); // no Include(employees)
...
return MapToDto(org); // o.Employees.Count = 0 — wrong
```

**Fix**: Replace `GetByIdAsync` with `GetWithEmployeesAsync`:

```csharp
var org = await _orgRepository.GetWithEmployeesAsync(id)
    ?? throw new KeyNotFoundException(...);
```

---

### CR-12: N+1 Query Problem in GetSystemDashboardAsync

**File**: `backend/ElectionVoting.Application/Services/DashboardService.cs`

**Problem**: For each organization, 4 separate database calls are made inside a loop. With 100 organizations this is 400+ queries per dashboard load:

```csharp
foreach (var orgId in orgIds)
{
    var employees = await _employeeRepo.GetByOrganizationAsync(orgId);
    var stations  = await _stationRepo.GetByOrganizationAsync(orgId);
    var attendance = await _attendanceRepo.GetByOrganizationAsync(orgId);
    var votes     = await _voteCountRepo.GetByOrganizationAsync(orgId);
}
```

**Fix**: Add bulk-fetch methods to the repositories (`GetAllWithOrganizationAsync`) and aggregate in memory, or add a dedicated `GetSystemTotalsAsync` query that uses SQL aggregation.

---

### CR-13: Employee Entity Duplicates User Data

**File**: `backend/ElectionVoting.Domain/Entities/Employee.cs`

**Problem**: `Employee` stores `FirstName`, `LastName`, `Email` which already exist on the linked `User`. These can diverge and create inconsistency:

```csharp
public string FirstName { get; set; }  // also on User
public string LastName { get; set; }   // also on User
public string Email { get; set; }      // also on User
```

**Fix**: For a long-term improvement, remove these from `Employee` and always read from `Employee.User`. For a short-term fix, ensure `UpdateEmployee` also updates the linked `User` (currently it does not).

---

### CR-14: No Input Validation on DTOs

**File**: All DTO files in `backend/ElectionVoting.Application/DTOs/`

**Problem**: DTOs are plain C# records with no `[Required]`, `[MaxLength]`, `[EmailAddress]`, or `[MinLength]` annotations. Invalid inputs (null strings, oversized payloads, invalid email formats) reach the service layer:

```csharp
public record CreateOrganizationDto(
    string OrganizationName,  // no [Required], no [MaxLength]
    string AdminEmail,        // no [EmailAddress]
    string AdminPassword);    // no [MinLength(8)]
```

**Fix**: Add `System.ComponentModel.DataAnnotations` attributes and enable model validation in the API:

```csharp
public record CreateOrganizationDto(
    [Required][MaxLength(200)] string OrganizationName,
    [Required][EmailAddress] string AdminEmail,
    [Required][MinLength(8)] string AdminPassword);
```

---

## 🔵 Low — Design & Code Quality

---

### CR-15: AuditLogsController Bypasses Service Layer

**File**: `backend/ElectionVoting.Api/Controllers/AuditLogsController.cs`

**Problem**: This is the only controller that injects a repository directly (`IAuditLogRepository`) instead of a service interface. This breaks the layered architecture and makes testing/mocking harder:

```csharp
public AuditLogsController(IAuditLogRepository auditRepo) // should be IAuditLogService
```

**Fix**: Create `IAuditLogService` / `AuditLogService` and inject that instead.

---

### CR-16: Connection String Uses `Encrypt=false`

**File**: `backend/ElectionVoting.Api/appsettings.json`

**Problem**: `TrustServerCertificate=true;Encrypt=false` disables transport encryption to the SQL Server. In any non-local environment this sends data in plaintext.

**Fix**: Remove `Encrypt=false` and `TrustServerCertificate=true` before deploying to any shared/prod environment. Use proper certificates.

---

### CR-17: `AllowedHosts: "*"` Too Permissive

**File**: `backend/ElectionVoting.Api/appsettings.json`

**Problem**: `"AllowedHosts": "*"` allows any host header. This can enable host header injection attacks.

**Fix**: Set to the specific domain in production: `"AllowedHosts": "api.yourdomain.com"`.

---

### CR-18: OrganizationService.DeleteAsync Ignores EF Core Cascade

**File**: `backend/ElectionVoting.Application/Services/OrganizationService.cs`

**Problem**: Employees are manually deleted in a loop even though EF Core is configured with `DeleteBehavior.Cascade` on the `Organization → Employee` relationship. The manual loop is redundant and error-prone:

```csharp
foreach (var employee in org.Employees.ToList())
    await _employeeRepository.DeleteAsync(employee); // EF would handle this
```

**Fix**: Remove the manual loop and let EF cascade handle it. Also add deletion of the linked `User` accounts (see CR-10).

---

### CR-19: CORS `AllowCredentials` with Wildcard Methods/Headers

**File**: `backend/ElectionVoting.Api/Program.cs`

**Problem**: The CORS policy uses `AllowAnyMethod()` and `AllowAnyHeader()` alongside `AllowCredentials()`. This is overly permissive. It also includes `http://localhost:3000` (React dev server?) which suggests dev origins leaked into the config.

**Fix**: Scope allowed headers to `Content-Type, Authorization` and allowed methods to `GET, POST, PUT, DELETE`. Remove `localhost:3000` and drive allowed origins from configuration per environment.

---

## Recommended Fix Priority

| Priority | Item                                            | Effort |
| -------- | ----------------------------------------------- | ------ |
| 1        | CR-01 — Remove secrets from repo                | S      |
| 2        | CR-04, CR-05, CR-07 — Fix RBAC ownership checks | M      |
| 3        | CR-10 — Delete orphaned Users on org delete     | S      |
| 4        | CR-11 — Fix UpdateOrg employee count bug        | S      |
| 5        | CR-14 — Add DTO validation attributes           | M      |
| 6        | CR-03 — Add rate limiting to auth endpoints     | S      |
| 7        | CR-09 — Fix hardcoded admin name                | S      |
| 8        | CR-12 — Fix N+1 dashboard query                 | L      |
| 9        | CR-02 — Move tokens out of localStorage         | L      |
| 10       | CR-08 — Fix refresh token race condition        | M      |
| 11       | CR-15 — Create AuditLogService layer            | M      |
| 12       | CR-13 — Resolve Employee/User data duplication  | L      |

---

## Next Steps for Phase 5

1. **Fix all Critical (🔴) items** before any deployment
2. **Fix all High (🟠) RBAC items** — these are functional security bugs
3. **Fix Medium (🟡)** items — CR-10 and CR-11 are data integrity bugs that are straightforward
4. Commit fixes per category with descriptive PR messages
5. Re-run the 175-test suite after each fix batch to confirm no regressions
