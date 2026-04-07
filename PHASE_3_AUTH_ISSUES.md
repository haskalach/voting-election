# 🔐 Phase 3 Backend: Authentication & Authorization Analysis

**Date:** April 7, 2026 | **Status:** CRITICAL ISSUES IDENTIFIED

---

## 1. JWT TOKEN CLAIMS & STRUCTURE

### Current Token Generation (AuthService.cs, lines 114-131)

```csharp
private string GenerateAccessToken(User user)
{
    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role.RoleName),
        new Claim("userId", user.UserId.ToString()),
        new Claim("organizationId", user.Organizations.FirstOrDefault()?.OrganizationId.ToString() ?? ""),
        new Claim(JwtRegisteredClaimNames.Iss, _configuration["Jwt:Issuer"] ?? "election-api"),
        new Claim(JwtRegisteredClaimNames.Aud, _configuration["Jwt:Audience"] ?? "election-client"),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };
    // ... token creation
}
```

### ✅ What's Included

- `sub`: User ID
- `email`: Email address
- `role`: User's role name (SystemOwner, Manager, Employee)
- `userId`: User ID (custom claim)
- `organizationId`: Organization ID (only for Manager/Organization users)
- `iss`: Issuer (election-api)
- `aud`: Audience (election-client)
- `jti`: JWT ID

### ❌ **CRITICAL MISSING CLAIM: `employeeId`**

The DataController endpoints expect an `employeeId` claim but it's **never added** to the token:

```csharp
// DataController.cs - Line 20, 37, 54, 64
[HttpPost("attendance")]
[Authorize(Roles = "Employee")]
public async Task<ActionResult<VoterAttendanceDto>> LogAttendance(...)
{
    var empIdClaim = User.FindFirst("employeeId");  // ❌ THIS WILL BE NULL!
    if (!int.TryParse(empIdClaim?.Value, out var empId))
        return Unauthorized();  // ← EMPLOYEES GET BLOCKED HERE
    // ...
}
```

---

## 2. ROLE-BASED ACCESS CONTROL (RBAC)

### 3 Roles Defined (Role.cs)

```csharp
public static class Names
{
    public const string SystemOwner = "SystemOwner";
    public const string Manager = "Manager";
    public const string Employee = "Employee";
}
```

### Authorization by Endpoint

| Endpoint                            | Roles Allowed        | Issue                              |
| ----------------------------------- | -------------------- | ---------------------------------- |
| **Auth/login**                      | [AllowAnonymous]     | ✅ OK                              |
| **Auth/register**                   | SystemOwner          | ✅ OK                              |
| **Auth/refresh**                    | [AllowAnonymous]     | ✅ OK                              |
| **Auth/logout**                     | [Authorize] any      | ✅ OK                              |
| **Dashboard/organization/{id}**     | SystemOwner, Manager | ✅ OK                              |
| **Dashboard/system**                | SystemOwner          | ✅ OK                              |
| **Employees** (GET/POST/PUT/DELETE) | SystemOwner, Manager | ✅ OK                              |
| **Data/attendance**                 | Employee             | ❌ **BROKEN - empIdClaim missing** |
| **Data/votes**                      | Employee             | ❌ **BROKEN - empIdClaim missing** |
| **Data/attendance/employee** (GET)  | Employee             | ❌ **BROKEN - empIdClaim missing** |
| **Data/votes/employee** (GET)       | Employee             | ❌ **BROKEN - empIdClaim missing** |

---

## 3. USER-EMPLOYEE RELATIONSHIP ARCHITECTURE

### Data Model Problem

#### User Entity (User.cs)

```csharp
public int UserId { get; set; }
public string Email { get; set; }
public int RoleId { get; set; }              // ← Links to Role
public ICollection<Organization> Organizations { get; set; }  // ← Only for Managers
// NO DIRECT LINK TO EMPLOYEE ❌
```

#### Employee Entity (Employee.cs)

```csharp
public int EmployeeId { get; set; }
public int OrganizationId { get; set; }
public int SupervisedByUserId { get; set; } // ← Links to User (supervisor)
public string Email { get; set; }           // ← MATCHES User.Email
// NO DIRECT LINK TO USER ❌
```

### The Problem

1. When an Employee logs in via User table, we have their **UserId**
2. To get their **EmployeeId**, we must look up the Employee record by **Email**
3. **No direct FK relationship** exists between User and Employee
4. EmployeeService creates both records separately (see line 38-49 and 56-68)

### Current Process Flow

```
1. Employee logs in with email/password
   ↓
2. AuthService.LoginAsync() finds User by email
   ↓
3. Token generated with userId, NOT employeeId
   ↓
4. Employee calls DataController endpoint
   ↓
5. DataController looks for "employeeId" claim ← NOT FOUND ❌
   ↓
6. Returns Unauthorized() ← EMPLOYEE LOCKED OUT
```

---

## 4. LOGIN RESPONSE STRUCTURE

### Current LoginResponseDto (after login)

```csharp
// AuthService.cs line 54-57
return new LoginResponseDto(
    accessToken,                          // JWT with missing employeeId
    refreshToken.Token,
    expiresIn,
    new UserDto(user.UserId, user.Email, user.FirstName, user.LastName, user.Role.RoleName, orgId)
);
```

### UserDto (What frontend receives)

```csharp
public record UserDto(
    int UserId,              // Has
    string Email,            // Has
    string FirstName,        // Has
    string LastName,         // Has
    string RoleName,         // Has
    int? OrganizationId      // Has (null for employees)
    // ❌ MISSING: EmployeeId
);
```

**Issue**: The frontend also won't know the EmployeeId to display or store.

---

## 5. AUTHORIZATION CHECKING PATTERNS

### AuthController (auth.ts - Correct ✅)

```csharp
[HttpPost("logout")]
[Authorize]  // ← Valid token required
public async Task<IActionResult> Logout()
{
    var userIdClaim = User.FindFirst("userId");  // ← Correctly uses userId
    if (!int.TryParse(userIdClaim?.Value, out var userId))
        return Unauthorized();
    await _authService.LogoutAsync(userId);
    return NoContent();
}
```

### DataController (data.ts - Broken ❌)

```csharp
[Authorize(Roles = "Employee")]  // ← Role check passes
public async Task<ActionResult<VoterAttendanceDto>> LogAttendance(...)
{
    var empIdClaim = User.FindFirst("employeeId");  // ← CLAIM DOESN'T EXIST
    if (!int.TryParse(empIdClaim?.Value, out var empId))
        return Unauthorized();  // ← FAILS HERE
}
```

### EmployeesController (employees.ts - Correct ✅)

```csharp
[Authorize(Roles = "SystemOwner,Manager")]
public async Task<ActionResult<EmployeeDto>> Create(...)
{
    var userIdClaim = User.FindFirst("userId");  // ← Correctly uses userId
    // ... create employee and link to supervisor
}
```

### DashboardController (dashboard.ts - Correct ✅)

```csharp
[Authorize(Roles = "SystemOwner,Manager")]
public async Task<ActionResult<DashboardDto>> GetOrganizationDashboard(int orgId)
    // No special claim checking needed
```

---

## 6. REPOSITORY & SERVICE LOOKUP METHODS

### UserRepository.cs

**Methods Available:**

- `GetByEmailAsync(email)` → User | null
- `GetByIdWithRoleAsync(userId)` → User | null
- `EmailExistsAsync(email)` → bool

**Missing:**

- ❌ `GetByIdWithEmployeeAsync()` - to fetch Employee linked to User
- ❌ `GetEmployeeByEmailAsync()` - to fetch Employee by User email

### EmployeeRepository.cs

**Methods Available:**

- `GetByOrganizationAsync(orgId)` → IEnumerable<Employee>
- `GetWithOrganizationAsync(empId)` → Employee | null
- `EmailExistsInOrgAsync(email, orgId)` → bool

**Missing:**

- ❌ `GetByEmailAsync(email)` - to find Employee by User email
- ❌ `GetByUserIdAsync(userId)` - to find Employee by User

---

## 7. LOGOUT & SESSION REVOCATION

### How Logout Works (Correct ✅)

```csharp
// AuthService.cs line 108-111
public async Task LogoutAsync(int userId)
{
    await _refreshTokenRepository.RevokeAllUserTokensAsync(userId);
    await _refreshTokenRepository.SaveChangesAsync();
}
```

**Process:**

1. Frontend calls POST /api/auth/logout with valid token
2. AuthController extracts userId from token's "userId" claim
3. All refresh tokens for that user are revoked
4. Access tokens remain valid (JWT is stateless) until expiration

**RefreshToken Table Structure:**

- Invalidates refresh tokens by setting `IsRevoked = true`
- Access tokens cannot be revoked (they're stateless JWTs)
- Access token expiration: **60 minutes** (configurable in appsettings.json)

---

## 8. POTENTIAL CAUSES OF EMPLOYEE LOCKOUT

### 🔴 **Root Cause 1: Missing employeeId Claim**

**Symptom:** Employees immediately rejected after login when accessing data endpoints

- They can log in ✅
- They get a valid JWT ✅
- They hit `/api/data/attendance` endpoint ❌ → Unauthorized

**Code Path:**

```
DataController line 20-22:
var empIdClaim = User.FindFirst("employeeId");  // Returns NULL
if (!int.TryParse(empIdClaim?.Value, out var empId))
    return Unauthorized();  // ← THIS EXECUTES
```

### 🔴 **Root Cause 2: No Method to Get EmployeeId from Token**

Even if we wanted to add the claim, AuthService needs a way to retrieve it:

```csharp
// WHAT WE NEED TO DO IN AUTHSERVICE:
var employee = await _employeeRepository.GetByEmailAsync(user.Email);
// BUT THIS METHOD DOESN'T EXIST ❌
```

### 🔴 **Root Cause 3: Possible organizationId = Empty String**

```csharp
// AuthService line 118
new Claim("organizationId", user.Organizations.FirstOrDefault()?.OrganizationId.ToString() ?? "")
```

For Employees, `user.Organizations` is empty (only Managers get organizations), so `organizationId` claim = `""` (empty string)

If frontend or backend tries to parse this as int, it will fail.

---

## 9. JWT TOKEN VALIDATION (Program.cs)

### Token Validation Configuration ✅

```csharp
// Program.cs line 17-28
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero  // ← No clock skew tolerance
        };
    });
```

**Token Config (appsettings.json):**

```json
{
  "Jwt": {
    "Secret": "your-super-secret-jwt-key-at-least-32-characters-long-change-in-production",
    "Issuer": "election-api",
    "Audience": "election-client",
    "ExpiresInMinutes": 60
  }
}
```

**Issues:**

- ✅ Signature validation: ON
- ✅ Issuer validation: ON
- ✅ Audience validation: ON
- ✅ Lifetime validation: ON
- ⚠️ ClockSkew: ZERO (strict timing, may cause issues if server clocks are slightly off)

---

## 10. AUTHORIZATION FLOW SUMMARY

### Scenario 1: SystemOwner Login

```
1. POST /api/auth/login { email, password }
2. AuthService finds User with Role "SystemOwner"
3. Token claims: userId, role=SystemOwner
4. Can access: /api/auth/register, /api/dashboard/system, /api/organizations/*
✅ WORKS
```

### Scenario 2: Manager Login

```
1. POST /api/auth/login { email, password }
2. AuthService finds User with Role "Manager"
3. Token claims: userId, organizationId (from user.Organizations[0])
4. Can access: /api/dashboard/organization/{orgId}, /api/organizations/{orgId}/employees
✅ WORKS
```

### Scenario 3: Employee Login (BROKEN)

```
1. POST /api/auth/login { email, password }
2. AuthService finds User with Role "Employee"
3. Token claims: userId, organizationId="" (EMPTY!), role=Employee
   ❌ employeeId NOT IN TOKEN
4. Tries to call: POST /api/data/attendance
5. DataController checks for employeeId claim
6. Claim doesn't exist → int.TryParse(null, ...) → false
7. Returns 401 Unauthorized
❌ BROKEN - EMPLOYEES LOCKED OUT
```

---

## 11. SUMMARY TABLE: AUTHORIZATION GAPS

| Component                             | Issue                                              | Impact                                  | Severity    |
| ------------------------------------- | -------------------------------------------------- | --------------------------------------- | ----------- |
| **AuthService.GenerateAccessToken()** | Missing `employeeId` claim                         | Employees can't access data endpoints   | 🔴 CRITICAL |
| **DataController**                    | Expects `employeeId` claim that doesn't exist      | All Employee operations fail            | 🔴 CRITICAL |
| **UserRepository**                    | No method to fetch linked Employee by UserId/Email | Can't add employeeId to token           | 🔴 CRITICAL |
| **EmployeeRepository**                | No method to fetch by Email or UserId              | Can't reverse-lookup Employee           | 🔴 CRITICAL |
| **User-Employee Relationship**        | No direct FK, only email matching                  | Architecture gap makes lookup difficult | 🔴 CRITICAL |
| **UserDto**                           | Missing EmployeeId field                           | Frontend doesn't know Employee ID       | 🟡 HIGH     |
| **organizationId Claim**              | Empty string for Employees                         | Frontend parsing may fail               | 🟡 MEDIUM   |

---

## 12. FIXES REQUIRED

### Fix 1: Add Method to EmployeeRepository

```csharp
// IEmployeeRepository.cs
Task<Employee?> GetByEmailAsync(string email);

// EmployeeRepository.cs
public async Task<Employee?> GetByEmailAsync(string email) =>
    await _context.Employees
        .Include(e => e.Organization)
        .FirstOrDefaultAsync(e => e.Email == email.ToLowerInvariant());
```

### Fix 2: Update AuthService.GenerateAccessToken()

```csharp
// Inject IEmployeeRepository into AuthService
// Then in GenerateAccessToken:

var employeeId = "";
if (user.Role.RoleName == Role.Names.Employee)
{
    var employee = await _employeeRepository.GetByEmailAsync(user.Email);
    if (employee != null)
        employeeId = employee.EmployeeId.ToString();
}

claims = new[]
{
    // ... existing claims ...
    new Claim("employeeId", employeeId),
    // ... more claims
};
```

### Fix 3: Update UserDto

```csharp
public record UserDto(
    int UserId,
    string Email,
    string FirstName,
    string LastName,
    string RoleName,
    int? OrganizationId,
    int? EmployeeId  // ← ADD THIS
);
```

### Fix 4: Update LoginResponseDto

Return Employee ID from login for frontend to manage state

---

## TESTING STRATEGY

### Test 1: Employee Login Token Contents

```
POST /api/auth/login
{
    "email": "employee@org.com",
    "password": "Password123"
}

Response: Validate JWT claims include:
✅ userId
✅ email
✅ role = "Employee"
🔴 employeeId (CURRENTLY MISSING)
❌ organizationId = "" (SHOULD HAVE EMPLOYEE'S ORG)
```

### Test 2: Employee Data Endpoint

```
POST /api/data/attendance
Authorization: Bearer <token>
Body: { "pollingStationId": 1, "voterCount": 50 }

Expected: 201 Created
Actual: 401 Unauthorized
Reason: empIdClaim is null
```

### Test 3: Employee Logout & Refresh

```
Still works ✅ because:
- Logout uses "userId" claim ✅
- Refresh doesn't need employee info ✅
```

---

## QUICK REFERENCE: FILE LOCATIONS

| File                                                                                                 | Lines          | Purpose                            |
| ---------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------- |
| [AuthService.cs](../backend/ElectionVoting.Application/Services/AuthService.cs)                      | 114-131        | Token generation (BROKEN)          |
| [DataController.cs](../backend/ElectionVoting.Api/Controllers/DataController.cs)                     | 20, 37, 54, 64 | Employee data endpoints (BROKEN)   |
| [EmployeeService.cs](../backend/ElectionVoting.Application/Services/EmployeeService.cs)              | 40-71          | Creates User + Employee separately |
| [Program.cs](../backend/ElectionVoting.Api/Program.cs)                                               | 17-28          | JWT config (correct)               |
| [UserRepository.cs](../backend/ElectionVoting.Infrastructure/Repositories/UserRepository.cs)         | All            | Missing Employee lookup            |
| [EmployeeRepository.cs](../backend/ElectionVoting.Infrastructure/Repositories/EmployeeRepository.cs) | All            | Missing Email/UserId lookup        |

---

## EMPLOYEE EXPERIENCE IMPACT

### Current State ❌

```
1. Manager creates Employee via UI
   - Creates User account with Employee role
   - Creates Employee record in database

2. Employee receives credentials
   - Email: john@org.com
   - Password: SecurePass123

3. Employee logs in
   - POST /api/auth/login succeeds ✅
   - Receives valid JWT ✅
   - Frontend stores token ✅

4. Employee tries to log attendance
   - POST /api/data/attendance
   - All 4 data endpoints: 401 UNAUTHORIZED ❌

5. Employee can use:
   - Logout ✅ (uses userId claim)
   - Refresh token ✅ (no employee context needed)
   - Cannot use any data entry features ❌
```

### Result

Employees are **locked out of core voting data entry functionality** immediately after login, making the application unusable for them.

---

**Next Steps:** See PHASE_3_FIXES.md for implementation guide
