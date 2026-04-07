# QUICK FINDINGS: Authentication & Authorization Audit

## 🔴 CRITICAL BLOCKER: Employee Data Endpoints Broken

### The Problem in 30 Seconds

1. **Token generated without `employeeId` claim**
   - AuthService.cs only adds: userId, email, role, organizationId (empty for employees)
   - Missing: employeeId

2. **DataController expects employeeId claim**
   - All 4 endpoints check: `var empIdClaim = User.FindFirst("employeeId");`
   - Claim is always NULL for employee tokens
   - Returns 401 Unauthorized immediately

3. **No Employee-User lookup method exists**
   - EmployeeRepository has no GetByEmailAsync() or GetByUserIdAsync()
   - AuthService can't retrieve employeeId even if it wanted to

### Result

✅ Employees CAN login  
✅ Employees CAN logout  
✅ Employees CAN refresh token  
❌ **Employees CANNOT log attendance or votes** (401 on all 4 endpoints)

---

## Token Content Comparison

### SystemOwner Token Claims

```
sub: 1
email: admin@election.lb
role: SystemOwner
userId: 1
organizationId: ""
```

✅ Can access: /api/auth/register, /api/dashboard/system, /api/organizations/\*

### Manager Token Claims

```
sub: 2
email: manager@org1.com
role: Manager
userId: 2
organizationId: 1  ← Gets org because in Organizations collection
```

✅ Can access: /api/dashboard/organization/1, /api/organizations/1/employees

### Employee Token Claims (BROKEN)

```
sub: 3
email: employee@org1.com
role: Employee
userId: 3
organizationId: ""  ← EMPTY! Employee not in Organizations collection
employeeId: ???     ← MISSING! Causes 401 on all data endpoints
```

❌ Can access: /api/auth/login, /api/auth/logout  
❌ Cannot access: /api/data/attendance, /api/data/votes, (4 endpoints)

---

## Authorization by Endpoint

| Endpoint                              | Role                 | Issue               | Status    |
| ------------------------------------- | -------------------- | ------------------- | --------- |
| POST /api/auth/login                  | [AllowAnonymous]     | -                   | ✅ Works  |
| POST /api/auth/logout                 | [Authorize]          | Uses userId ✅      | ✅ Works  |
| POST /api/data/attendance             | Employee             | Needs employeeId ❌ | ❌ BROKEN |
| POST /api/data/votes                  | Employee             | Needs employeeId ❌ | ❌ BROKEN |
| GET /api/data/attendance/employee     | Employee             | Needs employeeId ❌ | ❌ BROKEN |
| GET /api/data/votes/employee          | Employee             | Needs employeeId ❌ | ❌ BROKEN |
| GET /api/dashboard/organization/{id}  | Manager, SystemOwner | -                   | ✅ Works  |
| GET /api/organizations/{id}/employees | Manager, SystemOwner | -                   | ✅ Works  |

---

## Data Model Gap

```
USER TABLE              EMPLOYEE TABLE
───────────────        ──────────────
UserId ────────┐       EmployeeId
Email          │       Email (should match)
RoleId         │       OrganizationId
FirstName      │       SupervisedByUserId
LastName       │         ↑
IsActive       │         └─── User (supervisor only)
               │
               └─ No direct link to Employee ❌
                  Only email matching exists
```

**Problem:** To add employeeId to token, we need to look up Employee by email, but:

- EmployeeRepository has NO `GetByEmailAsync()` method
- UserRepository has NO method to fetch linked Employee

---

## Code Locations

| File                  | Issue                             | Line               |
| --------------------- | --------------------------------- | ------------------ |
| AuthService.cs        | Missing employeeId claim in token | 114-131            |
| DataController.cs     | Expects employeeId claim          | 20, 37, 54, 64     |
| EmployeeRepository.cs | Missing GetByEmailAsync()         | N/A - needs adding |
| UserRepository.cs     | Missing GetEmployeeAsync()        | N/A - needs adding |

---

## Three Fixes Needed

### 1. Add Repository Method

```csharp
// EmployeeRepository.cs
public async Task<Employee?> GetByEmailAsync(string email) =>
    await _context.Employees
        .FirstOrDefaultAsync(e => e.Email == email.ToLowerInvariant());
```

### 2. Update AuthService Token Generation

```csharp
// Inject IEmployeeRepository
// In GenerateAccessToken():
string employeeId = "";
if (user.Role.RoleName == Role.Names.Employee)
{
    var employee = await _employeeRepository.GetByEmailAsync(user.Email);
    employeeId = employee?.EmployeeId.ToString() ?? "";
}

// Add to claims:
new Claim("employeeId", employeeId)
```

### 3. Update DataController (Remove null check)

```csharp
// Will now work because employeeId claim exists
var empIdClaim = User.FindFirst("employeeId");
if (!int.TryParse(empIdClaim?.Value, out var empId))
    return Unauthorized();
```

---

## Test Case: Employee Cannot Access Data Endpoints

```
SETUP:
1. Create organization: "ElectionOrg1"
2. Create manager user with role "Manager"
3. Manager creates employee: john@org.com with password
4. EmployeeService creates:
   - User record (role=Employee-id=5)
   - Employee record (id=10, email=john@org.com, orgId=1)

TEST:
1. Login as employee@org.com → Success, gets JWT

2. Call POST /api/data/attendance
   Authorization: Bearer eyJ...
   Body: { pollingStationId: 1, voterCount: 50 }

3. DataController line 20:
   var empIdClaim = User.FindFirst("employeeId");
   // Returns NULL (claim doesn't exist in token)

4. TryParse returns false
   return Unauthorized();

5. Frontend gets 401
   User appears to be logged out
   (Because role check passes, but claim check fails)

REASON: Token never included employeeId claim
FIX: Add employeeId to claims in AuthService.GenerateAccessToken()
```

---

## Logout Still Works ✅

Despite the above issues, logout/session management works:

```csharp
// AuthController.LogOut()
var userIdClaim = User.FindFirst("userId");  // ✅ Always present in token
if (!int.TryParse(userIdClaim?.Value, out var userId))
    return Unauthorized();

await _authService.LogoutAsync(userId);
// Revokes all refresh tokens for userId
```

**Why:** Uses `userId` claim which IS included in all tokens

---

## Role-Based Endpoints Working Correctly

### Manager Features

- ✅ View organization dashboard
- ✅ Manage employees (CRUD)
- ✅ Create polling stations

### SystemOwner Features

- ✅ View system dashboard
- ✅ Register new managers
- ✅ Create organizations

### Employee Features

- ❌ Log voter attendance
- ❌ Log vote counts
- ❌ View personal records
  (All blocked due to missing employeeId claim)

---

## Summary

**What Works:**

- Encryption and token validation ✅
- Role-based route authorization ✅
- Manager/SystemOwner workflows ✅
- Login/Logout/Refresh ✅

**What's Broken:**

- Employee token is incomplete ❌
- DataController can't extract employee context ❌
- Employees locked out of data entry ❌

**Root Cause:**
Single missing `employeeId` claim, which requires:

1. New repository method
2. Updated AuthService
3. No changes to controllers/DTOs needed

**Effort to Fix:** ~15 minutes of coding
