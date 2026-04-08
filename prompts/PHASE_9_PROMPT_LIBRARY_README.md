# Phase 9: Standardized Prompt Library & Templates

**Status**: ✅ In Development  
**Version**: 1.0  
**Last Updated**: April 8, 2026

---

## Overview

Phase 9 establishes a **team-wide prompt library** with:

- **Parameterized prompt templates** for reusability
- **Organized prompt library** by function (code-review, documentation, testing, etc.)
- **Prompt chaining workflows** for complex multi-step tasks
- **Prompt testing framework** to validate outputs
- **Version control & changelog** for prompt evolution

---

## Quick Start

### 1. Use a Prompt Template

**Template structure** (e.g., `templates/code-review.prompt`):

```
# Code Review Template
Context: {PROJECT_CONTEXT}
File: {FILE_PATH}
Language: {LANGUAGE}
Standards: {STANDARDS_FILE}

Review this code for:
1. {REVIEW_FOCUS_POINT_1}
2. {REVIEW_FOCUS_POINT_2}
3. {REVIEW_FOCUS_POINT_3}

Provide:
- Issues found (critical/warning/info)
- Improvement suggestions
- Positive findings
```

**Usage**: Replace `{PLACEHOLDER}` with actual values:

```
Context: Election Voting backend (.NET Core 10)
File: backend/ElectionVoting.Application/Services/AuthService.cs
Language: C#
Standards: .instructions-backend.md

Review this code for:
1. Security vulnerabilities
2. Performance issues
3. Code style conformance
...
```

### 2. Chain Multiple Prompts

**Example workflow**: Code Review → Documentation → Tests

```
Step 1: Code Review (get feedback)
Step 2: Generate Documentation (using review output)
Step 3: Create Tests (using code + documentation)
```

**Implementation**: See `templates/workflows/code-review-to-tests.workflow`

### 3. Version Your Prompts

**Structure**:

```
prompts/
├── v1.0/          # Stable version
├── v1.1/          # Bug fixes
├── v2.0-draft/    # In development
└── CHANGELOG.md   # Version history
```

**Usage**: Specify version when using: `prompts/v2.0/code-review.prompt`

---

## Directory Structure

```
prompts/
├── PHASE_9_PROMPT_LIBRARY_README.md    (this file)
├── LIBRARY_INDEX.md                    (quick reference)
├── PROMPT_VERSIONING.md                (versioning strategy)
├── PROMPT_TESTING.md                   (testing framework)
├── PROMPT_CHAINING.md                  (workflow examples)
│
├── v1.0/                               (current stable version)
│   ├── templates/
│   │   ├── code-review.prompt
│   │   ├── documentation.prompt
│   │   ├── testing.prompt
│   │   ├── refactoring.prompt
│   │   ├── security-audit.prompt
│   │   ├── performance-analysis.prompt
│   │   ├── requirements-analysis.prompt
│   │   └── tech-design.prompt
│   │
│   ├── workflows/
│   │   ├── code-review-to-tests.workflow
│   │   ├── feature-to-doc.workflow
│   │   ├── bug-fix-to-test.workflow
│   │   ├── refactoring-cycle.workflow
│   │   └── security-to-hardening.workflow
│   │
│   └── examples/
│       ├── code-review-example.md
│       ├── documentation-example.md
│       ├── test-suite-example.md
│       └── chaining-example.md
│
├── test-cases/                         (test prompts)
│   ├── code-review.test.md
│   ├── documentation.test.md
│   ├── testing.test.md
│   └── ...
│
├── scripts/                            (execution scripts)
│   ├── run-prompt.ps1                  (PowerShell)
│   ├── prompt-chain.ps1                (chaining runner)
│   └── validate-prompt.ps1             (testing runner)
│
├── CHANGELOG.md                        (version history)
├── code_review_prompt.md               (legacy)
├── document_prompt.md                  (legacy)
├── requirements_analysis_prompt.md     (legacy)
├── tech_design_prompt.md               (legacy)
└── testing_prompt.md                   (legacy)
```

---

## Core Concepts

### 1. Prompt Templates with Parameters

**Benefits**:

- Reuse across team
- Consistent output quality
- Easy to customize
- Version control friendly

**Syntax**:

```
{PARAMETER_NAME}     - Required parameter
{OPTIONAL_PARAM?}    - Optional parameter
{CHOICE: opt1|opt2}  - Single choice
{MULTI: a,b,c}       - Multiple selections
```

### 2. Prompt Library Organization

**Categories**:

- **Code Quality**: code-review, refactoring, security-audit
- **Documentation**: documentation, api-docs, readme
- **Testing**: testing, test-generation, integration-test
- **Design**: tech-design, architecture-review, api-design
- **Analysis**: requirements-analysis, performance-analysis, code-analysis
- **Maintenance**: bug-fix, issue-triage, dependency-update

### 3. Prompt Chaining

**Example chain** (3 prompts):

```
1. Code Review Prompt
   ↓ (output: review findings)
2. Documentation Generation Prompt
   ↓ (uses review output + code)
3. Test Generation Prompt
   (uses code + documentation)
```

### 4. Testing Prompts

**Types**:

- **Output validation**: Does output match expected format?
- **Quality checks**: Is output complete and accurate?
- **Security review**: Does output follow security practices?
- **Regression tests**: Does output match previous version?

### 5. Versioning

**Strategy**:

- **v1.0, v1.1, v1.2**: Minor improvements & bug fixes
- **v2.0, v3.0**: Major changes to structure/output
- **v2.0-draft, v3.0-beta**: Work in progress

**Changelog**: All versions tracked with rationale

---

## Usage Examples

### Single Prompt - Code Review

```powershell
# 1. Copy template: prompts/v1.0/templates/code-review.prompt
# 2. Fill in parameters:
$params = @{
    PROJECT_CONTEXT = "Election Voting backend (.NET Core 10, clean arch)"
    FILE_PATH = "backend/ElectionVoting.Application/Services/EmployeeService.cs"
    LANGUAGE = "C#"
    STANDARDS_FILE = ".instructions-backend.md"
    REVIEW_FOCUS_POINT_1 = "Security vulnerabilities in user isolation"
    REVIEW_FOCUS_POINT_2 = "Performance issues with N+1 queries"
    REVIEW_FOCUS_POINT_3 = "Error handling consistency"
}

# 3. Run: .\scripts\run-prompt.ps1 -Template code-review.prompt -Parameters $params
```

### Chained Prompts - Feature Development

```powershell
# Workflow: Feature Request → Design → Code → Tests → Documentation

$chain = @(
    @{ name = "tech-design"; params = @{ FEATURE = "Voting Results Dashboard" } }
    @{ name = "code-review"; params = @{ FILE_PATH = "components/dashboard.ts" } }
    @{ name = "testing"; params = @{ COMPONENT = "DashboardComponent" } }
    @{ name = "documentation"; params = @{ API = "GET /api/elections/{id}/results" } }
)

# Run: .\scripts\prompt-chain.ps1 -Chain $chain -SaveOutput
```

---

## Benefits

✅ **Consistency**: All team members use same prompts, same outputs
✅ **Reusability**: Write once, use 100+ times
✅ **Maintainability**: Update prompt in one place, everyone benefits
✅ **Versionable**: Track changes to prompts over time
✅ **Testable**: Validate prompt quality before deployment
✅ **Scalable**: From 5 people to 500, same prompt library
✅ **Searchable**: Find right prompt by function or tag
✅ **Chainable**: Complex tasks from simple building blocks

---

## Getting Started

### For Individual Developers

1. **Browse** `LIBRARY_INDEX.md` to find needed prompt
2. **Copy** prompt template from `v1.0/templates/`
3. **Fill** in `{PARAMETERS}` for your context
4. **Paste** into ChatGPT/Copilot/Claude
5. **See** consistent, high-quality output

### For Team Leads

1. **Review** this README to understand structure
2. **Customize** prompts for your team's standards
3. **Test** using `PROMPT_TESTING.md` framework
4. **Version** your customizations in `v1.1/`, `v2.0/`, etc.
5. **Share** changelog with team

### For Dev Team

1. **Run** `scripts/run-prompt.ps1` to fill parameters automatically
2. **Chain** prompts with `scripts/prompt-chain.ps1`
3. **Test** prompts with `scripts/validate-prompt.ps1`
4. **Report** issues in `test-cases/` for improvement

---

## Next Steps

1. ✅ Understand this directory structure
2. 📖 Read `LIBRARY_INDEX.md` for quick reference
3. 📝 Read `PROMPT_VERSIONING.md` for versioning strategy
4. 🧪 Read `PROMPT_TESTING.md` for testing framework
5. ⛓️ Read `PROMPT_CHAINING.md` for workflow examples
6. 🚀 Use templates for your next task

---

## Integration with Phase 8 (Instruction Files)

**Phase 8** created component-specific context:

- `.instructions-backend.md` - .NET patterns
- `.instructions-frontend.md` - Angular patterns
- `.instructions-api.md` - REST design
- `.instructions-domain.md` - Business logic
- `.instructions-infrastructure.md` - Data access
- `.instructions-agents.md` - Using AI effectively

**Phase 9** creates prompt templates that **reference** Phase 8:

```
Standards: Use patterns from {INSTRUCTIONS_FILE}
Context: {PROJECT_CONTEXT} (see .instructions.md)
Examples: See .instructions-backend.md for async patterns
```

Together: **Instruction files** (what to do) + **Prompt templates** (how to ask)

---

## Support & Feedback

**Issue Found?**

1. Test with `PROMPT_TESTING.md` framework
2. Document in `test-cases/{prompt-name}.test.md`
3. Suggest fix in pull request with rationale
4. Update `CHANGELOG.md`

**Want to Add Prompt?**

1. Create in `v1.0-draft/templates/`
2. Test with test cases
3. Document in `examples/`
4. PR to merge to stable version

**Questions?**

- See `LIBRARY_INDEX.md` for quick answers
- See `PROMPT_CHAINING.md` for complex scenarios
- See `examples/` for real usage patterns

---

**Phase 9 Status**: 🚀 In Development  
**Next**: Complete all prompt templates, workflows, scripts, and testing  
**Timeline**: 1-2 weeks for full implementation
