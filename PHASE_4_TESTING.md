# Phase 4: Testing & Quality Assurance

**Status**: Starting April 7, 2026  
**Target Completion**: April 10, 2026  
**Objective**: Achieve 80%+ code coverage and production readiness

---

## 📋 Phase Overview

This phase focuses on comprehensive testing to ensure system reliability, data integrity, and expected behavior across all features.

### Key Deliverables

1. ✅ Unit tests for all core services (target: 80%+ coverage)
2. ✅ Angular component tests for all feature components
3. ✅ Integration tests for complete workflows
4. ✅ Test coverage reports
5. ✅ Bug fixes identified during testing

---

## 🔧 Backend Testing Strategy

### Technology Stack

- **Framework**: xUnit (C# testing framework)
- **Mocking**: Moq (for mocking dependencies)
- **Coverage**: coverlet (for code coverage analysis)

### Test Structure

```
Tests/
  TodoApp.Tests/
    Domain/
    Application/
      Services/
        - AuthServiceTests.cs
        - EmployeeServiceTests.cs
        - OrganizationServiceTests.cs
        - DataServiceTests.cs
        - DashboardServiceTests.cs
    Infrastructure/
      Repositories/
        - EmployeeRepositoryTests.cs
        - OrganizationRepositoryTests.cs
    Api/
      Controllers/
        - AuthControllerTests.cs
        - OrganizationControllerTests.cs
        - EmployeeControllerTests.cs
        - DataControllerTests.cs
```

### Backend Test Cases

#### 1. AuthService Tests (12 tests, ~40 lines each)

- ✅ LoginAsync - valid credentials
- ✅ LoginAsync - invalid password
- ✅ LoginAsync - user not found
- ✅ LoginAsync - deactivated account
- ✅ RefreshTokenAsync - valid token
- ✅ RefreshTokenAsync - invalid/expired token
- ✅ RefreshTokenAsync - deactivated user
- ✅ RegisterAsync - successful registration
- ✅ RegisterAsync - email already exists
- ✅ GenerateAccessTokenAsync - includes correct claims (userId, email, role)
- ✅ GenerateAccessTokenAsync - includes employeeId for Employee role
- ✅ GenerateAccessTokenAsync - includes organizationId for Manager role

#### 2. EmployeeService Tests (14 tests)

- ✅ CreateAsync - successful creation with password
- ✅ CreateAsync - email already exists globally
- ✅ CreateAsync - email already exists in org
- ✅ CreateAsync - password too short
- ✅ CreateAsync - creates User account with Employee role
- ✅ CreateAsync - links User to Employee via UserId
- ✅ UpdateAsync - updates employee details
- ✅ UpdateAsync - prevents invalid updates (if applicable)
- ✅ GetByIdAsync - returns employee with org
- ✅ GetByOrganizationAsync - returns all org employees
- ✅ DeactivateAsync - soft deactivates employee
- ✅ DeleteAsync - hard deletes employee
- ✅ GetByUserIdAsync - returns employee by user id
- ✅ EmailExistsInOrgAsync - checks org-level duplicate

#### 3. OrganizationService Tests (10 tests)

- ✅ CreateAsync - creates org, admin user, and admin employee
- ✅ CreateAsync - admin receives Manager role
- ✅ CreateAsync - admin Employee record has UserId set
- ✅ CreateAsync - org name already exists
- ✅ CreateAsync - admin email already exists
- ✅ CreateAsync - manager role not found
- ✅ GetByIdAsync - returns org with employees
- ✅ GetAllAsync - returns all orgs with employee counts
- ✅ UpdateAsync - updates org details
- ✅ DeleteAsync - soft deletes org

#### 4. DataService Tests (12 tests)

- ✅ LogAttendanceAsync - success with valid data
- ✅ LogAttendanceAsync - prevents negative voter count
- ✅ LogAttendanceAsync - prevents duplicate same-day attendance
- ✅ LogAttendanceAsync - uses employee from token
- ✅ LogVoteCountAsync - success with valid data
- ✅ LogVoteCountAsync - prevents negative vote count
- ✅ LogVoteCountAsync - prevents duplicate candidate same day
- ✅ LogVoteCountAsync - normalizes candidate name
- ✅ LogVoteCountAsync - case-insensitive duplicate detection
- ✅ GetAttendanceByEmployeeAsync - returns formatted records
- ✅ GetVoteCountsByEmployeeAsync - returns formatted records
- ✅ GetAttendanceByPollingStationAsync - returns station records

#### 5. DashboardService Tests (8 tests)

- ✅ GetOrganizationDashboardAsync - aggregates org data
- ✅ GetOrganizationDashboardAsync - only returns org's data
- ✅ GetOrganizationDashboardAsync - calculates voter turnout
- ✅ GetOrganizationDashboardAsync - sums vote counts per candidate
- ✅ GetSystemDashboardAsync - returns system-wide stats (SystemOwner only)
- ✅ GetSystemDashboardAsync - aggregates across all orgs
- ✅ GetSystemDashboardAsync - includes trending data
- ✅ Authorization - enforces role-based access

#### 6. Repository Tests

- ✅ EmployeeRepository.GetByUserIdAsync - finds employee by user id
- ✅ EmployeeRepository.GetByOrganizationAsync - lists org employees
- ✅ EmployeeRepository.EmailExistsInOrgAsync - checks email uniqueness
- ✅ OrganizationRepository.NameExistsAsync - checks org name uniqueness
- ✅ VoterAttendanceRepository.ExistsForEmployeeOnDateAsync - detects duplicates
- ✅ VoteCountRepository.ExistsForCandidateOnDateAsync - detects duplicates

#### 7. API Controller Tests (10 tests)

- ✅ AuthController.Login - returns token on success
- ✅ AuthController.Login - returns 401 on invalid credentials
- ✅ OrganizationsController.Create - requires SystemOwner role
- ✅ OrganizationsController.Delete - cascade deletes employees
- ✅ EmployeeController.Create - requires Manager role
- ✅ EmployeeController.Update - updates employee record
- ✅ DataController.LogAttendance - records and validates
- ✅ DataController.LogVotes - records and validates
- ✅ DashboardController.GetOrganization - returns aggregated data
- ✅ DashboardController.GetSystem - requires SystemOwner role

**Total Backend Tests**: ~56 unit tests + integration tests

---

## 🎨 Frontend Testing Strategy

### Technology Stack

- **Framework**: Jasmine (Angular's testing framework)
- **Test Runner**: Karma
- **Coverage**: Istanbul (via Angular)

### Test Structure

```
src/app/
  auth/
    login.spec.ts
    logout.spec.ts
  shared/
    shell.spec.ts
  organizations/
    org-list.spec.ts
    org-detail.spec.ts
    org-form.spec.ts
  employees/
    employee-list.spec.ts
    employee-form.spec.ts
  data-logging/
    attendance.spec.ts
    vote-count.spec.ts
  dashboard/
    dashboard.spec.ts
```

### Frontend Test Cases

#### 1. Auth Component Tests (8 tests)

- ✅ LoginComponent renders form
- ✅ LoginComponent validates email format
- ✅ LoginComponent validates password required
- ✅ LoginComponent submits login request
- ✅ LoginComponent handles 401 error
- ✅ LoginComponent stores JWT token
- ✅ LoginComponent navigates to dashboard
- ✅ LogoutComponent clears token and redirects

#### 2. Organization Component Tests (12 tests)

- ✅ OrgListComponent displays organizations
- ✅ OrgListComponent filters by search term
- ✅ OrgListComponent handles delete with confirmation
- ✅ OrgListComponent calls API on delete
- ✅ OrgFormComponent creates new org
- ✅ OrgFormComponent validates required fields
- ✅ OrgFormComponent validates email format
- ✅ OrgFormComponent validates password length (min 8)
- ✅ OrgFormComponent submits form data
- ✅ OrgFormComponent shows error on duplicate email
- ✅ OrgDetailComponent displays org info
- ✅ OrgDetailComponent loads employees

#### 3. Employee Component Tests (12 tests)

- ✅ EmployeeListComponent displays employees
- ✅ EmployeeListComponent filters by status
- ✅ EmployeeListComponent handles delete
- ✅ EmployeeFormComponent creates employee
- ✅ EmployeeFormComponent hides password on edit
- ✅ EmployeeFormComponent shows password on create
- ✅ EmployeeFormComponent validates password (min 8 chars on create)
- ✅ EmployeeFormComponent updates employee details
- ✅ EmployeeFormComponent validates email format
- ✅ EmployeeFormComponent shows error on duplicate email
- ✅ EmployeeFormComponent handles date picker
- ✅ EmployeeFormComponent shows success message

#### 4. Data Logging Component Tests (10 tests)

- ✅ AttendanceComponent displays form
- ✅ AttendanceComponent validates voter count (non-negative)
- ✅ AttendanceComponent validates polling station required
- ✅ AttendanceComponent submits data
- ✅ AttendanceComponent shows success message
- ✅ AttendanceComponent shows error on duplicate
- ✅ VoteCountComponent displays form
- ✅ VoteCountComponent validates vote count (non-negative)
- ✅ VoteCountComponent validates candidate name required
- ✅ VoteCountComponent prevents duplicate candidates

#### 5. Dashboard Component Tests (8 tests)

- ✅ DashboardComponent loads org data
- ✅ DashboardComponent displays attendance stats
- ✅ DashboardComponent displays vote distribution
- ✅ DashboardComponent shows role-based data views
- ✅ DashboardComponent loads system dashboard (SystemOwner)
- ✅ DashboardComponent displays system-wide stats
- ✅ DashboardComponent formats numbers correctly
- ✅ DashboardComponent handles empty data gracefully

#### 6. Service Tests (10 tests)

- ✅ AuthService.login() returns token
- ✅ AuthService.logout() clears token
- ✅ AuthService stores token in localStorage
- ✅ AuthService.getToken() retrieves token
- ✅ OrganizationService.getAll() calls API
- ✅ OrganizationService.create() submits form
- ✅ EmployeeService.create() includes password field
- ✅ DataLoggingService.logAttendance() validates and submits
- ✅ DataLoggingService.logVotes() validates and submits
- ✅ DashboardService.getDashboard() merges org context

#### 7. Guard Tests (4 tests)

- ✅ AuthGuard blocks unauthenticated users
- ✅ AuthGuard allows authenticated users
- ✅ RoleGuard blocks unauthorized roles
- ✅ RoleGuard allows proper roles

#### 8. Interceptor Tests (3 tests)

- ✅ AuthInterceptor adds JWT token to requests
- ✅ AuthInterceptor handles 401 responses
- ✅ AuthInterceptor retries with refreshed token

**Total Frontend Tests**: ~67 tests

---

## 🔄 Integration Testing

### End-to-End Workflows

#### Workflow 1: System Setup

1. Login as SystemOwner (default credentials)
2. Create Organization (name, party, email, address)
3. System auto-creates Manager user
4. Verify org appears in list
5. Verify Manager can login

#### Workflow 2: Employee Onboarding

1. Login as Organization Manager
2. Create Employee (name, email, password)
3. System creates User with Employee role
4. Verify Employee record created with UserId
5. Logout and login as Employee
6. Verify Employee sees dashboard

#### Workflow 3: Data Entry

1. Login as Employee
2. Navigate to Log Attendance
3. Select polling station and date
4. Enter voter count
5. Submit - verify success message
6. Attempt duplicate entry - verify error
7. Login as Manager - verify attendance appears in dashboard

#### Workflow 4: Data Aggregation

1. Create multiple employees
2. Each logs multiple attendance/vote records
3. Manager views dashboard - verify aggregation
4. SystemOwner views system dashboard - verify totals
5. Verify calculations (voter turnout, vote distribution)

#### Workflow 5: Delete Cascade

1. Create Org with Manager
2. Create Employees under that org
3. Employees create records (attendance, votes)
4. Delete organization
5. Verify all employees deleted
6. Verify all records deleted
7. Verify Manager user deactivated (or deleted)

---

## 📊 Code Coverage Goals

| Component            | Target  | Metric             |
| -------------------- | ------- | ------------------ |
| Domain Entities      | 90%     | Line coverage      |
| Application Services | 85%     | Line coverage      |
| Infrastructure/Repos | 80%     | Line coverage      |
| API Controllers      | 75%     | Line coverage      |
| Frontend Components  | 70%     | Statement coverage |
| Frontend Services    | 80%     | Statement coverage |
| **Overall**          | **80%** | **Combined**       |

### Coverage Commands

**Backend:**

```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

**Frontend:**

```bash
ng test --watch=false --code-coverage
```

---

## 🐛 Known Issues & Test Scenarios

### Authentication Issues (Fixed)

- ✅ Employee JWT token missing employeeId claim - FIXED
- ✅ Organization admin missing UserId link - FIXED
- ⚠️ Password field validation on create vs edit - REQUIRES TESTING

### Validation Issues

- ✅ Negative value prevention - IMPLEMENTED
- ✅ Duplicate entry detection - IMPLEMENTED
- ⚠️ Candidate name normalization on duplicate check - REQUIRES TESTING
- ⚠️ Email uniqueness across system - REQUIRES TESTING

### Data Integrity

- ⚠️ Cascade delete on organization - REQUIRES TESTING
- ⚠️ Soft delete behavior - REQUIRES TESTING
- ⚠️ Audit log creation - REQUIRES TESTING

---

## 📅 Testing Timeline

### Week 1: Backend Unit Tests

- **Day 1-2**: Auth Service tests (12 tests)
- **Day 2-3**: Employee & Organization Service tests (24 tests)
- **Day 3-4**: Data Service tests (12 tests)
- **Day 4-5**: Dashboard Service tests (8 tests)
- **Day 5**: Repository & Controller tests (10+ tests)

### Week 2: Frontend Unit Tests

- **Day 1-2**: Auth & Organization component tests (20 tests)
- **Day 2-3**: Employee & Data Logging component tests (22 tests)
- **Day 3-4**: Service & Guard tests (13 tests)
- **Day 4-5**: Dashboard component tests (8 tests)

### Week 3: Integration & Coverage

- **Day 1-2**: Integration test scenarios (5 workflows)
- **Day 2-3**: Coverage analysis and gap identification
- **Day 3-4**: Bug fixes for identified issues
- **Day 4-5**: Final verification and documentation

---

## 🎯 Success Criteria

- [ ] All unit tests passing (56+ backend, 67+ frontend)
- [ ] Code coverage at 80%+ overall
- [ ] All 5 integration workflows passing
- [ ] Zero critical bugs
- [ ] All known issues resolved
- [ ] Documentation updated with test results
- [ ] Test reports generated and reviewed

---

## 📝 Test Execution Commands

### Backend Tests

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover

# Show coverage report
dotnet test /p:CollectCoverage=true /p:CoverageReportFormat=lcov

# Run specific test class
dotnet test --filter ClassName=AuthServiceTests
```

### Frontend Tests

```bash
# Run all tests
ng test --watch=false

# Run with code coverage
ng test --watch=false --code-coverage

# Watch mode for development
ng test

# Run specific test file
ng test --include='**/auth.spec.ts'
```

---

## 📚 Test File Template

### Backend (xUnit C#)

```csharp
using Xunit;
using Moq;
using YourApp.Services;
using YourApp.Repositories;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepositoryMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _refreshTokenRepositoryMock = new Mock<IRefreshTokenRepository>();
        _authService = new AuthService(_userRepositoryMock.Object, _refreshTokenRepositoryMock.Object);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        var request = new LoginRequestDto { Email = "test@example.com", Password = "password123" };
        var user = new User { UserId = 1, Email = "test@example.com" };
        _userRepositoryMock.Setup(x => x.GetByEmailAsync(request.Email)).ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.AccessToken);
    }
}
```

### Frontend (Jasmine/Karma TypeScript)

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LoginComponent } from "./login.component";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj("AuthService", ["login"]);
    const routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it("should render login form", () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector("form")).toBeTruthy();
  });

  it("should submit login request with valid credentials", async () => {
    authService.login.and.returnValue(Promise.resolve({ token: "abc123" }));

    component.email = "test@example.com";
    component.password = "password123";
    await component.login();

    expect(authService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
    );
  });
});
```

---

## 📋 Testing Checklist

- [ ] Setup xUnit/Moq for backend tests
- [ ] Create test projects and file structure
- [ ] Write AuthService unit tests
- [ ] Write Employee/Organization service tests
- [ ] Write Data/Dashboard service tests
- [ ] Write repository and controller tests
- [ ] Run backend test suite and verify coverage
- [ ] Fix any failing tests
- [ ] Setup Karma configuration for frontend
- [ ] Write component unit tests
- [ ] Write service/guard/interceptor tests
- [ ] Run frontend test suite and verify coverage
- [ ] Fix any failing tests
- [ ] Create integration test scenarios
- [ ] Execute integration workflows
- [ ] Generate coverage reports
- [ ] Identify and fix coverage gaps
- [ ] Document test results
- [ ] Update CI/CD pipeline (if applicable)

---

**Document Status**: Phase 4 Planning Complete  
**Next Step**: Begin Backend Unit Testing  
**Owner**: QA Team  
**Date**: April 7, 2026
