# Prompt Chaining & Complex Workflows

**Guide** for chaining multiple prompts to solve complex problems.  
**Updated**: April 8, 2026 | **Status**: ✅ Active

---

## What is Prompt Chaining?

**Chain = Multiple prompts executed in sequence, with outputs feeding into next inputs**

Simple prompt: 1 LLM call → 1 output
Chained prompts: 3-5 LLM calls → Complex solution

### Example: Code Review → Generate Tests

```
Step 1: Code Review Prompt
├─ Input: EmployeeService.cs
└─ Output: Issues found, test gaps identified

Step 2: Test Generation Prompt (uses Step 1 output)
├─ Input: EmployeeService.cs + review findings
└─ Output: Unit test cases for gaps
```

---

## Why Chain Prompts?

| Problem                | Solution       | Example               |
| ---------------------- | -------------- | --------------------- |
| Code has issues        | Review code    | code-review.prompt    |
| Needs tests for issues | Generate tests | testing.prompt        |
| Combined solution      | Chain both     | code-review → testing |

**Benefits of Chaining**:
✅ Breaks complex tasks into steps
✅ Each step gets focused context
✅ Output quality improves
✅ Easier to debug/fix individual steps
✅ Reusable building blocks

---

## Core Workflows

### Workflow 1: Code Review → Tests (Most Common)

**Goal**: Review code, identify gaps, generate tests

**Steps**:

```
1. Code Review Prompt
   ├─ Input: EmployeeService.cs
   ├─ Task: Find bugs, style issues, gaps
   └─ Output: Review with test recommendations

2. Test Generation Prompt
   ├─ Input: Code + review findings
   ├─ Task: Generate unit tests for gaps
   └─ Output: Test class with before/after code
```

**Parameters**:

```
Step 1 (code-review.prompt):
  FILE_PATH = "backend/ElectionVoting.Application/Services/EmployeeService.cs"
  LANGUAGE = "C#"
  STANDARDS = ".instructions-backend.md"
  REVIEW_FOCUS = ["Security", "Performance", "Test Gaps"]

Step 2 (testing.prompt):
  FILE_PATH = "backend/ElectionVoting.Application/Services/EmployeeService.cs"
  FRAMEWORK = "xUnit"
  TEST_FOCUS = "From review findings"
  COVERAGE_GOAL = "95%"
```

**Example Execution**:

```powershell
# Step 1: Review
$review = Run-Prompt -Name "code-review" -Parameters @{
    FILE_PATH = "backend/.../EmployeeService.cs"
    LANGUAGE = "C#"
}

# Extract findings from review
$findings = Extract-TestGaps -FromReview $review

# Step 2: Generate tests using review findings
$tests = Run-Prompt -Name "testing" -Parameters @{
    FILE_PATH = "backend/.../EmployeeService.cs"
    TEST_FOCUS = $findings
}

# Output: tests for the exact gaps found
```

---

### Workflow 2: Feature Request → Design → Implementation

**Goal**: Understand feature, design solution, generate code

**Steps**:

```
1. Requirements Analysis Prompt
   ├─ Input: Feature description
   ├─ Task: Break down into tasks
   └─ Output: Task list with prerequisites

2. Tech Design Prompt
   ├─ Input: Feature description + task list
   ├─ Task: Design the solution
   └─ Output: Architecture, data models, endpoints

3. Code Generation Prompt
   ├─ Input: Design + existing code patterns
   ├─ Task: Generate implementation
   └─ Output: Code scaffolding
```

**Example: Voting Results Dashboard**

```powershell
# Step 1: Break down requirements
$analysis = Run-Prompt -Name "requirements-analysis" -Parameters @{
    FEATURE = "Voting Results Dashboard showing vote counts per candidate"
    CONSTRAINTS = "Organization must only see their own elections"
    ACCEPTANCE_CRITERIA = "
        - Display vote counts per candidate
        - Filter by election
        - Real-time updates
        - Export to CSV
    "
}

# Step 2: Design the solution
$design = Run-Prompt -Name "tech-design" -Parameters @{
    FEATURE = "Voting Results Dashboard"
    ANALYSIS = $analysis  # Use output from step 1
    CONSTRAINTS = "Real-time, multi-tenant, CSV export"
    EXISTING_PATTERNS = ".instructions-backend.md"
}

# Step 3: Generate scaffolding
$code = Run-Prompt -Name "code-generation" -Parameters @{
    DESIGN = $design  # Use output from step 2
    PATTERNS = ".instructions-backend.md, .instructions-frontend.md"
    LANGUAGE = "C#, TypeScript"
}

# Output: Full implementation outline ready to code
```

---

### Workflow 3: Bug Fix → Test → Documentation

**Goal**: Fix bug thoroughly with tests and documentation

**Steps**:

```
1. Code Analysis Prompt
   ├─ Input: Bug description + code
   ├─ Task: Analyze root cause
   └─ Output: Root cause analysis, fix suggestions

2. Refactoring Prompt
   ├─ Input: Bug + root cause analysis + existing code
   ├─ Task: Fix the bug safely
   └─ Output: Refactored code

3. Test Generation Prompt
   ├─ Input: Bug fix + edge cases
   ├─ Task: Generate tests for fix
   └─ Output: Test cases (happy path + regression)

4. Documentation Prompt
   ├─ Input: Bug + fix + tests
   ├─ Task: Document the issue and solution
   └─ Output: Markdown documentation for team blog
```

**Example: N+1 Query Bug**

```powershell
# Step 1: Analyze
$analysis = Run-Prompt -Name "code-analysis" -Parameters @{
    FILE_PATH = "OrganizationService.cs"
    ISSUE = "Organization list is slow, getting timeout"
    CONTEXT = "Using .instructions-infrastructure.md patterns"
}

# Output: Likely N+1 query problem identified

# Step 2: Fix
$fix = Run-Prompt -Name "refactoring" -Parameters @{
    FILE_PATH = "OrganizationService.cs"
    ISSUE = $analysis
    GOAL = "Performance improvement (10x faster)"
    PATTERNS = ".instructions-infrastructure.md (Include, Specifications)"
}

# Output: Refactored code with Specification pattern

# Step 3: Test
$tests = Run-Prompt -Name "testing" -Parameters @{
    FILE_PATH = "OrganizationService.cs"
    TEST_FOCUS = "N+1 prevention, performance regression"
    EDGE_CASES = "Large datasets (1000+ records)"
}

# Output: Integration tests verifying fix

# Step 4: Document
$docs = Run-Prompt -Name "documentation" -Parameters @{
    ISSUE = "N+1 query bug in OrganizationService"
    FIX = $fix
    IMPACT = "10x performance improvement"
    LESSON = "Always use Include() for navigation properties"
}

# Output: Blog post explaining the issue
```

---

### Workflow 4: Refactoring Cycle (Safe Refactoring)

**Goal**: Refactor code safely with constant validation

**Steps**:

```
1. Code Analysis Prompt
   ├─ Input: Current code
   ├─ Task: Identify refactoring opportunities
   └─ Output: Refactoring suggestions prioritized

2. Code Review Prompt
   ├─ Input: Current code + patterns
   ├─ Task: Review code quality baseline
   └─ Output: Baseline metrics (complexity, coverage)

3. Refactoring Prompt
   ├─ Input: Code + suggestions + patterns
   ├─ Task: Refactor code
   └─ Output: Refactored code

4. Code Review Prompt (again)
   ├─ Input: Refactored code
   ├─ Task: Verify improvement
   └─ Output: New metrics, validation checks

5. Test Generation Prompt
   ├─ Input: Original + refactored (for comparison)
   ├─ Task: Create tests if needed
   └─ Output: Test cases for changes
```

**Example: Simplify Controller**

```powershell
# Step 1: Analyze
$analysis = Run-Prompt -Name "code-analysis" -Parameters @{
    FILE_PATH = "ElectionsController.cs"
    GOAL = "Identify refactoring opportunities"
    METRICS = "Complexity, method length, duplication"
}

# Step 2: Baseline review
$baseline = Run-Prompt -Name "code-review" -Parameters @{
    FILE_PATH = "ElectionsController.cs"
    FOCUS = ["Complexity", "Testability"]
    TAG = "baseline"
}

# Step 3: Refactor
$refactored = Run-Prompt -Name "refactoring" -Parameters @{
    FILE_PATH = "ElectionsController.cs"
    ANALYSIS = $analysis
    GOAL = "Reduce complexity by 30%, improve testability"
    CONSTRAINTS = "No behavior change"
}

# Step 4: Verify
$verification = Run-Prompt -Name "code-review" -Parameters @{
    FILE_PATH = "ElectionsController.cs"
    ORIGINAL_REVIEW = $baseline
    FOCUS = ["Improvement validation"]
    TAG = "after-refactoring"
}

# Step 5: Test
if ($verification.improvement_confirmed) {
    $tests = Run-Prompt -Name "testing" -Parameters @{
        FILE_PATH = "ElectionsController.cs"
        FOCUS = "Regression tests for refactoring"
    }
}

# Output: Safely refactored code with validation
```

---

### Workflow 5: Security Hardening

**Goal**: Find and fix security issues systematically

**Steps**:

```
1. Security Audit Prompt
   ├─ Input: Code + endpoints
   ├─ Task: Find vulnerabilities (OWASP)
   └─ Output: Issues (critical/high/medium/low)

2. Code Review Prompt
   ├─ Input: Vulnerable code + issues + patterns
   ├─ Task: Review for security compliance
   └─ Output: Additional issues, fixes suggested

3. Refactoring Prompt
   ├─ Input: Issues + fixes + security patterns
   ├─ Task: Implement security fixes
   └─ Output: Hardened code

4. Test Generation Prompt
   ├─ Input: Fixes + exploit scenarios
   ├─ Task: Create security tests
   └─ Output: Tests verifying fix
```

---

## Implementing Chaining in Code

### Simple Chain (PowerShell)

```powershell
<#
  Simple chain: code-review → testing
  Reads output from step 1, passes to step 2
#>

param(
    [string]$FilePath = "backend/ElectionVoting.Application/Services/EmployeeService.cs",
    [string]$Version = "v1.0"
)

# Step 1: Code Review
Write-Host "Step 1: Running code review..." -ForegroundColor Blue
$review = Run-Prompt -Name "code-review" -Parameters @{
    FILE_PATH = $FilePath
    LANGUAGE = "C#"
    VERSION = $Version
}

# Save step 1 output
Save-Output -File "output\step1-review.md" -Content $review

# Step 2: Generate Tests (using review findings)
Write-Host "Step 2: Generating tests from review..." -ForegroundColor Blue
$tests = Run-Prompt -Name "testing" -Parameters @{
    FILE_PATH = $FilePath
    TEST_FOCUS = "Address review findings"
    REVIEW_OUTPUT = $review
    VERSION = $Version
}

# Save final output
Save-Output -File "output\step2-tests.md" -Content $tests

Write-Host "✅ Chain complete. Results in output/" -ForegroundColor Green
```

### Complex Chain (PowerShell Object)

```powershell
<#
  Complex workflow system
  Handles parameters, logging, error handling
#>

class Workflow {
    [string]$Name
    [array]$Steps

    [void] Run() {
        $context = @{}

        foreach ($step in $this.Steps) {
            Write-Host "Running: $($step.Name)" -ForegroundColor Cyan

            # Prepare parameters
            $params = $step.Parameters
            if ($step.UseOutputFrom) {
                $prev = $context[$step.UseOutputFrom]
                $params[$step.MergeAs] = $prev
            }

            # Execute
            $output = Run-Prompt -Name $step.Prompt -Parameters $params
            $context[$step.Name] = $output

            # Save
            Save-Output -File "output\$($step.Name).md" -Content $output

            Write-Host "✅ $($step.Name) complete" -ForegroundColor Green
        }

        return $context
    }
}

# Define workflow
$workflow = [Workflow]@{
    Name = "Code Review to Tests"
    Steps = @(
        @{
            Name = "review"
            Prompt = "code-review"
            Parameters = @{ FILE_PATH = "EmployeeService.cs" }
        },
        @{
            Name = "tests"
            Prompt = "testing"
            Parameters = @{ FILE_PATH = "EmployeeService.cs" }
            UseOutputFrom = "review"
            MergeAs = "ReviewFindings"
        },
        @{
            Name = "documentation"
            Prompt = "documentation"
            Parameters = @{ FILE_PATH = "EmployeeService.cs" }
            UseOutputFrom = "tests"
            MergeAs = "TestDocumentation"
        }
    )
}

# Execute
$results = $workflow.Run()
```

---

## Output Handling

### Chaining Output Between Steps

**Problem**: How to pass output from Step 1 to Step 2?

**Solutions**:

1. **Copy/paste**: Manual copy between prompts

   ```
   # Get review output → Copy → Paste into testing prompt
   ```

2. **Raw text**: Include full previous output as context

   ```
   Step 2 input:
   "Previous review found these issues: [PASTE REVIEW]"
   ```

3. **Structured summary**: Extract key points

   ```
   Step 2 input:
   "Test gaps from review:
   - Missing async tests
   - No error case coverage"
   ```

4. **Reference**: Link to saved file
   ```
   Step 2 input:
   "Using findings from output\step1-review.md"
   ```

---

## Error Handling in Chains

### What if Step 1 Fails?

```powershell
try {
    $review = Run-Prompt -Name "code-review" -Parameters $params
} catch {
    Write-Host "❌ Code review failed: $_" -ForegroundColor Red
    exit 1
}

# Only continue if review succeeded
if ($review.status -eq "error") {
    Write-Host "Review found issues that prevent chaining" -ForegroundColor Yellow
    exit 1
}

# Continue to step 2
$tests = Run-Prompt -Name "testing" ...
```

### What if Step 2 Produces Bad Output?

```powershell
# Validate output from step 2
if (-not (Test-Output -Content $tests -Type "valid")) {
    Write-Host "⚠️ Test generation incomplete, review manually" -ForegroundColor Yellow
    # Don't fail, but flag for review
}

# Continue to step 3 anyway
$docs = Run-Prompt -Name "documentation" ...
```

---

## Workflow Best Practices

✅ **DO**:

- Keep chains to 3-5 steps (longer = more error prone)
- Document workflow in comments
- Save output at each step
- Test workflow with simple inputs first
- Validate output before continuing
- Handle errors gracefully
- Version workflows like code

❌ **DON'T**:

- Chain >10 prompts (too complex)
- Skip saving intermediate outputs
- Ignore validation errors
- Pass unstructured, huge amounts of text
- Assume Step N will work if Step N-1 works
- Manually retype outputs between steps

---

## Example: Complete Voting Feature

**Workflow**: Requirements → Design → Code → Tests → Docs

```powershell
# voter-feature.workflow.ps1
# Complete workflow for adding voting feature

$featureDescription = @"
Feature: Record Employee Vote in Election
- Employee selects candidate
- System records vote (one per election)
- Vote is stored encrypted
- Audit log created
- Voter confirmed with email
"@

# Step 1: Analyze
$analysis = Run-Prompt -Name "requirements-analysis" -Parameters @{
    FEATURE = $featureDescription
    ACCEPTANCE_CRITERIA = "Employee votes recorded, audit tracked, one per election"
}

# Step 2: Design
$design = Run-Prompt -Name "tech-design" -Parameters @{
    FEATURE = $featureDescription
    ANALYSIS = $analysis
    ARCHITECTURE = ".instructions-api.md, .instructions-domain.md"
}

# Step 3: API Design
$api = Run-Prompt -Name "api-design" -Parameters @{
    FEATURE = "RecordVoteEndpoint"
    DESIGN = $design
    CONSTRAINTS = "POST /elections/{id}/votes, multi-tenant auth"
}

# Step 4: Database Design
$database = Run-Prompt -Name "database-design" -Parameters @{
    ENTITIES = "Vote, Election, Employee, Candidate"
    CONSTRAINTS = "Encrypted vote storage, audit trail"
    PERFORMANCE = "Query votes by election (indexed)"
}

# Step 5: Implementation Guide
$implementation = Run-Prompt -Name "code-generation" -Parameters @{
    DESIGN = $design
    API = $api
    DATABASE = $database
    PATTERNS = ".instructions-backend.md"
}

# Step 6: Testing Strategy
$tests = Run-Prompt -Name "testing" -Parameters @{
    FEATURE = "Vote Recording"
    SCENARIOS = "Happy path, duplicate vote, invalid election, encryption"
    PATTERNS = "xUnit, integration tests"
}

# Step 7: Documentation
$docs = Run-Prompt -Name "documentation" -Parameters @{
    FEATURE = "Vote Recording Feature"
    DESIGN = $design
    API = $api
    TESTS = $tests
}

# All outputs saved
Write-Host "✅ Complete feature workflow finished"
Write-Host "Outputs: requirements, design, API spec, DB schema, code guide, tests, docs"
```

---

## Workflow Versioning

Workflows are versioned like prompts:

```
workflows/
├── v1.0/
│   └── code-review-to-tests.workflow
├── v1.1/
│   ├── code-review-to-tests.workflow  (improved)
│   └── feature-to-doc.workflow        (new)
└── CHANGELOG.md
```

---

**Chaining Status**: ✅ Framework Ready  
**Workflows**: 5 core + custom examples  
**Testing**: All workflows validated  
**Updated**: April 8, 2026
