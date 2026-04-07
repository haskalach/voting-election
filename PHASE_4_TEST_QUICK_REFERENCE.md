# Phase 4 Testing Quick Reference

## Test Infrastructure Status

### Backend Testing Setup ✅

```
Project: ElectionVoting.Tests
Framework: xUnit
Mocking: Moq (v4.20.72)
Coverage: coverlet.collector (v8.0.1)
Location: backend/ElectionVoting.Tests/
```

### Frontend Testing Setup

```
Project: election-voting-ui
Framework: Jasmine (included with Angular 18)
Runner: Karma (included with Angular 18)
Coverage: Angular CLI built-in
Location: frontend/election-voting-ui/
```

---

## Running Backend Tests

### Run All Tests

```bash
cd backend
dotnet test
```

### Run Specific Test Class

```bash
cd backend
dotnet test --filter FullyQualifiedName~AuthServiceTests
```

### Run with Code Coverage

```bash
cd backend
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

### View Coverage Report

Coverage reports are generated in `backend/coverage/` directory after running tests with coverage.

---

## Running Frontend Tests

### Run All Tests (Headless)

```bash
cd frontend/election-voting-ui
ng test --watch=false
```

### Run Tests in Watch Mode

```bash
cd frontend/election-voting-ui
ng test
```

### Run with Code Coverage

```bash
cd frontend/election-voting-ui
ng test --code-coverage
```

### View Coverage Report

Coverage reports generated in `frontend/election-voting-ui/coverage/` directory.

---

## Test Files Created

### Backend Test Templates

- `ElectionVoting.Tests/AuthServiceTests.cs` - Authentication tests
- `ElectionVoting.Tests/EmployeeServiceTests.cs` - Employee CRUD tests
- (Additional test files to be created per PHASE_4_TESTING.md)

### Frontend Test Templates

- To be created in `frontend/election-voting-ui/src/app/` directories
- One test file per component/service

---

## Test Execution Order (Recommended)

### Phase 4 Week 1: Backend Unit Tests

```bash
# Step 1: Fix any test compilation issues
cd backend
dotnet build ElectionVoting.Tests/ElectionVoting.Tests.csproj

# Step 2: Run AuthService tests
dotnet test --filter FullyQualifiedName~AuthServiceTests

# Step 3: Run EmployeeService tests
dotnet test --filter FullyQualifiedName~EmployeeServiceTests

# Step 4: Run all backend tests
dotnet test

# Step 5: Generate coverage
dotnet test /p:CollectCoverage=true
```

### Phase 4 Week 2: Frontend Unit Tests

```bash
# Step 1: Create test files (see PHASE_4_TESTING.md for template)
# Update frontend/election-voting-ui/src/app/{feature}/*.spec.ts

# Step 2: Run tests
cd frontend/election-voting-ui
ng test --watch=false

# Step 3: Generate coverage
ng test --code-coverage
```

### Phase 4 Week 3: Integration Tests & Final Coverage

```bash
# Manual integration test workflows (documented in PHASE_4_TESTING.md):
# 1. System Setup
# 2. Employee Onboarding
# 3. Data Entry
# 4. Data Aggregation
# 5. Delete Cascade

# Generate final coverage report
cd backend && dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
cd frontend && ng test --code-coverage

# Verify 80%+ overall coverage achieved
```

---

## Coverage Analysis

### How to Interpret Coverage Results

**High Coverage** (80-100%):

- Good test coverage
- Most code paths tested
- Few untested edge cases

**Medium Coverage** (60-79%):

- Acceptable but needs improvement
- Missing some edge cases
- Focus testing efforts here

**Low Coverage** (<60%):

- Add more tests needed
- Significant gaps in coverage

### Identify Gaps

```bash
# After running tests with coverage:
# 1. Open coverage/index.html (backend)
# 2. Look for red/orange highlighted lines
# 3. Add tests for those code paths
```

---

## Debugging Tests

### Run Single Test

```bash
# Backend
dotnet test --filter Name~LoginAsync_WithValidCredentials_ReturnsToken

# Frontend
ng test --include='**/auth.service.spec.ts'
```

### Debug Mode

```bash
# Backend - Run in debug mode
dotnet test --logger "console;verbosity=detailed"

# Frontend - Open browser DevTools
ng test  # Will keep browser open for debugging
```

---

## Test Maintenance

### Add New Tests

1. Create test class in appropriate folder
2. Follow naming: `{ClassName}Tests.cs` (C#) or `{class-name}.spec.ts` (TS)
3. Use existing test templates as reference
4. Add using statements and dependency setup
5. Run: `dotnet test` or `ng test`

### Update Existing Tests

1. Modify test method in appropriate file
2. Update test name if behavior changes
3. Ensure Assert statements verify correct behavior
4. Run tests to verify: `dotnet test` or `ng test`

### Fix Failing Tests

1. Review test failure message
2. Check if code or test is wrong
3. Update accordingly
4. Rerun tests
5. Verify coverage maintained

---

## Continuous Integration Ready

Once tests are implemented, you can add CI/CD:

```bash
# Example GitHub Actions / Azure Pipelines
dotnet test --logger "trx" --results-directory ./TestResults/
ng test --watch=false --browsers=ChromeHeadless --code-coverage
```

---

## Success Criteria (Phase 4)

- ✅ 56+ backend unit tests passing
- ✅ 67+ frontend unit tests passing
- ✅ 5 integration test workflows passing
- ✅ 80%+ overall code coverage
- ✅ All tests automated and repeatable
- ✅ CI/CD pipeline ready

---

## Resources

- **Test Plan**: `PHASE_4_TESTING.md`
- **System Status**: `PHASE_3_COMPLETE_PHASE_4_READY.md`
- **Backend Tests**: `backend/ElectionVoting.Tests/`
- **Frontend Tests**: `frontend/election-voting-ui/src/app/**/*.spec.ts`

---

**Updated**: April 7, 2026  
**Status**: Ready for Phase 4 testing execution ✅
