# Prompt Testing & Validation Framework

**System** for testing and validating prompt quality.  
**Updated**: April 8, 2026 | **Status**: ✅ Active

---

## Philosophy

Prompts are **production code**. Just like code needs tests, prompts need validation:

- **Do outputs meet quality standards?**
- **Are outputs consistent across runs?**
- **Do outputs follow project conventions?**
- **Are there formatting or completeness errors?**

---

## Testing Layers

### Layer 1: Immediate Validation

After running a prompt, checklist of output quality:

- ✅ Format correct (Markdown, JSON, code)?
- ✅ All examples present?
- ✅ No hallucinations or errors?
- ✅ Tone appropriate?
- ✅ Complete and actionable?

### Layer 2: Scenario Testing

Run prompt on known inputs and compare outputs:

- **Happy path**: Expected input → Expected output
- **Edge cases**: Boundary conditions → Correct handling
- **Error cases**: Invalid input → Helpful error message

### Layer 3: Regression Testing

Ensure updates don't break previous functionality:

- Run test suite against v1.0
- Run test suite against v1.1
- Compare outputs for consistency

### Layer 4: Continuous Testing

Automated testing in CI/CD:

- On PR: Run all prompt tests
- On merge: Validate against baseline
- Weekly: Full regression test suite

---

## Testing Template

Create file: `test-cases/{prompt-name}.test.md`

```markdown
# Code Review Prompt Tests

**Prompt**: code-review.prompt v1.0  
**Test Date**: 2026-04-08  
**Tester**: Team Lead

## Test Cases

### TC-1: Happy Path - Find Security Issue

- **Input**: C# file with SQL injection vulnerability
- **Expected**: Identifies vulnerability with severity "critical"
- **Status**: ✅ PASS

### TC-2: Happy Path - Find Style Issue

- **Input**: C# file with inconsistent naming
- **Expected**: Identifies style violation with severity "warning"
- **Status**: ✅ PASS

### TC-3: Edge Case - Empty File

- **Input**: Empty C# file
- **Expected**: Returns "No issues found" gracefully
- **Status**: ✅ PASS

### TC-4: Edge Case - Very Large File (500+ lines)

- **Input**: Large controller file
- **Expected**: Analyzes all sections, no truncation
- **Status**: ✅ PASS

### TC-5: Error Case - Invalid Language

- **Input**: Language "COBOL" (unsupported)
- **Expected**: Helpful error: "C# or TypeScript supported"
- **Status**: ✅ PASS

## Summary

- Total: 5 tests
- Passed: 5 ✅
- Failed: 0
- Coverage: 100%

## Notes

- All tests passed
- Ready for production
```

---

## Running Test Cases

### Manual Testing

```powershell
# Fill template parameters
$params = @{
    FILE_PATH = "backend/ElectionVoting.Application/Services/AuthService.cs"
    LANGUAGE = "C#"
    # ... other params
}

# Run prompt
$result = Run-Prompt -Name "code-review" -Parameters $params

# Validate output manually
# - Does it find real issues?
# - Is formatting correct?
# - Are recommendations actionable?

# Document in test file
```

### Automated Testing

```powershell
# Test single prompt
.\scripts\validate-prompt.ps1 -Prompt "code-review" -Version "v1.0"

# Test all prompts
.\scripts\validate-prompt.ps1 -Version "v1.0"

# Test with regression
.\scripts\validate-prompt.ps1 -Version "v1.1" -Compare "v1.0"

# Output: test-results.json with pass/fail status
```

---

## Test Categories

### 1. Format Testing

Does output have correct structure?

**Checklist**:

- ✅ Markdown is valid
- ✅ Code blocks use correct language tags
- ✅ Tables are properly formatted
- ✅ Lists are properly indented
- ✅ JSON is valid (if applicable)
- ✅ No orphaned formatting symbols

**Example Test**:

````markdown
### TC-Format: Output Structure

- **Input**: Any valid input for code-review.prompt
- **Expected**: Output has:
  1. Summary section
  2. Findings section (with severity badges)
  3. Suggestions section
  4. Positives section
- **How to validate**:
  ```powershell
  $output | Select-String "^##" | Count  # Should find 4+ sections
  ```
````

````

### 2. Completeness Testing
Does output include all required information?

**Checklist**:
- ✅ All parameters addressed
- ✅ Examples included
- ✅ Explanations provided
- ✅ No truncation
- ✅ All sections filled
- ✅ Citations/references where needed

**Example Test**:
```markdown
### TC-Completeness: All Sections Present
- **Input**: code-review.prompt for EmployeeService.cs
- **Expected**:
  - Summary (1-2 sentences)
  - Issues found (≥1 issue)
  - Severity levels assigned
  - Suggestions provided
  - Positive findings included
- **Status**: ✅ PASS (all sections present)
````

### 3. Accuracy Testing

Is the output technically correct?

**Checklist**:

- ✅ No hallucinations (made-up issues)
- ✅ Issues are real problems in code
- ✅ Suggestions are viable
- ✅ Examples compile/run
- ✅ References are accurate
- ✅ No contradictions

**Example Test**:

```markdown
### TC-Accuracy: Issue Validity

- **Input**: AuthService.cs (known good code, no security issues)
- **Expected**: Code review reports 0 critical issues
- **What happened**: Review found 2 false positive "issues"
- **Status**: ❌ FAIL (hallucination detected)
- **Action**: Adjust prompt to reduce false positives
```

### 4. Consistency Testing

Does output match previous versions?

**Checklist**:

- ✅ Same inputs → Similar findings
- ✅ Same severity labels
- ✅ Same output format
- ✅ Same tone/voice
- ✅ Same recommendation style

**Example Test**:

```markdown
### TC-Consistency-Regression

- **Input**: PollingStationService.cs
- **v1.0 Output**: Found 3 issues (1 critical, 2 warnings)
- **v1.1 Output**: Found 3 issues (1 critical, 2 warnings)
- **Difference**: None significant
- **Status**: ✅ PASS
```

### 5. Security Testing

Does prompt expose sensitive information?

**Checklist**:

- ✅ No API keys in examples
- ✅ No hardcoded passwords
- ✅ No PII in outputs
- ✅ No SQL queries shown unnecessarily
- ✅ Security best practices followed

**Example Test**:

```markdown
### TC-Security: No Hardcoded Secrets

- **Input**: Code with connection string
- **Expected**: Review does NOT output connection string
- **How to test**: Search output for "Server=", "Password="
- **Status**: ✅ PASS (safe handling)
```

---

## Test Execution Workflow

### Before Release to v1.0

```
1. Create test cases (test-cases/*.test.md)
   ├─ Format tests
   ├─ Completeness tests
   ├─ Accuracy tests
   └─ Security tests

2. Run manual tests
   ├─ Happy paths (normal inputs)
   ├─ Edge cases (boundaries)
   └─ Error cases (invalid inputs)

3. Document results
   ├─ Pass/fail status
   ├─ Issues found
   └─ Remediation

4. Get approval
   ├─ Code review
   ├─ PM approval
   └─ Team sign-off

5. Tag as v1.0
   ├─ Update CHANGELOG.md
   ├─ Create tag in git
   └─ Announce ready for production
```

### Before Release to v1.1

```
1. Test v1.1 from scratch (same as v1.0)

2. Regression test
   ├─ Run test-cases against v1.1
   ├─ Compare with v1.0 results
   ├─ Ensure no regressions

3. Test changes specifically
   ├─ New features work correctly
   ├─ Improvements are effective
   ├─ Bug fixes validated

4. Integration test
   ├─ Chaining workflows still work
   ├─ Scripts handle new version
   └─ Backward compatibility OK

5. Release
   ├─ Create v1.1 directory
   ├─ Tag in git
   └─ Update documentation
```

---

## Test Results Format

Save as `test-results.json`:

```json
{
  "prompt": "code-review",
  "version": "v1.0",
  "test_date": "2026-04-08T10:30:00Z",
  "tester": "Team Lead",
  "status": "PASS",
  "summary": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "skipped": 0
  },
  "results": [
    {
      "test_id": "TC-1",
      "name": "Happy Path - Security Issue",
      "category": "Accuracy",
      "status": "PASS",
      "duration_ms": 45000,
      "notes": "Correctly identified SQL injection vulnerability"
    },
    {
      "test_id": "TC-4",
      "name": "Edge Case - Large File",
      "category": "Completeness",
      "status": "PASS",
      "duration_ms": 60000,
      "notes": "Processed 500+ lines without truncation"
    }
  ],
  "coverage": {
    "format": 100,
    "completeness": 100,
    "accuracy": 100,
    "security": 100
  },
  "ready_for_production": true
}
```

---

## Quality Gates

**Prompt cannot be released unless**:

- ✅ Format tests: **100% pass**
- ✅ Completeness tests: **100% pass**
- ✅ Accuracy tests: **95%+ pass** (some variance acceptable)
- ✅ Security tests: **100% pass**
- ✅ Code review approval: **At least 1 other person**
- ✅ Documentation: **Complete and accurate**
- ✅ Changelog: **Updated with changes**

---

## Example Test Case: code-review.prompt

```markdown
# Test: code-review.prompt v1.0

**Status**: ✅ PASSED (15/15 tests)  
**Date**: 2026-04-08  
**Tester**: Hassan Kalash

## Quick Summary

- Format: ✅ Perfect
- Completeness: ✅ All sections
- Accuracy: ✅ Real issues found
- Security: ✅ Safe handling

## Test Results

### Format Tests (3/3 PASS)

- TC-1: Markdown valid ✅
- TC-2: Code blocks correct ✅
- TC-3: Sections properly structured ✅

### Completeness Tests (4/4 PASS)

- TC-4: Summary present ✅
- TC-5: Findings section complete ✅
- TC-6: Suggestions present ✅
- TC-7: No truncation ✅

### Accuracy Tests (5/5 PASS)

- TC-8: AuthService.cs - found real security issue ✅
- TC-9: EmployeeService.cs - correct async findings ✅
- TC-10: OrganizationService.cs - valid suggestions ✅
- TC-11: No false positives ✅
- TC-12: Severity levels accurate ✅

### Security Tests (3/3 PASS)

- TC-13: No API keys exposed ✅
- TC-14: Connection strings not shown ✅
- TC-15: PII not included ✅

## Conclusion

✅ **READY FOR PRODUCTION**

All tests passing. Prompt provides accurate, complete, safe code reviews.
Approved for v1.0 release on April 8, 2026.
```

---

## Continuous Testing

### Weekly Test Run

```powershell
# Run on main branch weekly (Mondays)
$allPrompts = Get-ChildItem "prompts/v1.0/templates/*.prompt"

foreach ($prompt in $allPrompts) {
    .\scripts\validate-prompt.ps1 -Prompt $prompt

    # Commit results
    git add test-results/$prompt.json
}

git commit -m "Chore: Weekly prompt validation - all passing"
git push
```

### Pre-Release Test Run

```powershell
# Before releasing new version
$newVersion = "v1.1"

# Run full test suite
.\scripts\validate-prompt.ps1 -Version $newVersion -Full

# Compare with previous version
.\scripts\validate-prompt.ps1 -Version $newVersion -Compare "v1.0"

# Generate report
New-Item "release-notes/$newVersion-test-report.md"
```

---

## Test Maintenance

### Adding New Tests

When you find a bug or issue:

1. **Reproduce** the issue with actual inputs
2. **Create test case** documenting the problem
3. **Fix the prompt**
4. **Verify** test passes with fix
5. **Add to test suite** permanently
6. **Document** in CHANGELOG.md

### Updating Tests for New Version

When creating v1.1 from v1.0:

```powershell
Copy-Item "test-cases/v1.0" -Destination "test-cases/v1.1" -Recurse

# Update test cases to verify new features
# Then run:
.\scripts\validate-prompt.ps1 -Version "v1.1"
```

---

**Testing Status**: ✅ Framework Ready  
**Coverage**: All 15 prompts testable  
**Quality Gate**: 95%+ accuracy required  
**Updated**: April 8, 2026
