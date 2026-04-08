# Prompt Library Index

**Quick reference** for all prompts in the Election Voting system.  
**Updated**: April 8, 2026 | **Version**: 1.0

---

## Quick Find

**Need help with...**

| Task           | Prompt                         | Purpose                                    |
| -------------- | ------------------------------ | ------------------------------------------ |
| Reviewing code | `code-review.prompt`           | Find bugs, style issues, security problems |
| Writing docs   | `documentation.prompt`         | Auto-generate API/component documentation  |
| Creating tests | `testing.prompt`               | Generate unit test cases                   |
| Architecture   | `tech-design.prompt`           | Design solutions, architecture decisions   |
| New feature    | `requirements-analysis.prompt` | Break down requirements → tasks            |
| Securing code  | `security-audit.prompt`        | Find & fix security vulnerabilities        |
| Speed up code  | `performance-analysis.prompt`  | Identify & optimize performance            |
| Refactoring    | `refactoring.prompt`           | Modernize code, improve readability        |

---

## All Prompts by Category

### Code Quality (4 prompts)

#### 1. **code-review.prompt** ⭐⭐⭐⭐⭐

- **Purpose**: Review code for bugs, style, performance, security
- **Input**: File path, language, review focus areas
- **Output**: Issues (critical/warning/info), suggestions, positives
- **Best for**: Pull request reviews, pre-commit checks
- **Version**: v1.0
- **Location**: `v1.0/templates/code-review.prompt`

#### 2. **refactoring.prompt** ⭐⭐⭐⭐

- **Purpose**: Suggest refactoring improvements
- **Input**: File path, current code, desired outcome
- **Output**: Refactored code, explanation of changes
- **Best for**: Improving existing code, debt reduction
- **Version**: v1.0
- **Location**: `v1.0/templates/refactoring.prompt`

#### 3. **security-audit.prompt** ⭐⭐⭐⭐⭐

- **Purpose**: Find security vulnerabilities
- **Input**: File path, security standards, threat model
- **Output**: Vulnerabilities (critical/high/medium/low), fixes
- **Best for**: Security reviews, OWASP compliance
- **Version**: v1.0
- **Location**: `v1.0/templates/security-audit.prompt`

#### 4. **performance-analysis.prompt** ⭐⭐⭐⭐

- **Purpose**: Identify performance bottlenecks
- **Input**: File path, performance goals, metrics
- **Output**: Bottlenecks, optimization suggestions, expected improvements
- **Best for**: Optimization work, scalability reviews
- **Version**: v1.0
- **Location**: `v1.0/templates/performance-analysis.prompt`

---

### Documentation (3 prompts)

#### 5. **documentation.prompt** ⭐⭐⭐⭐⭐

- **Purpose**: Generate API/SDK documentation
- **Input**: Code file, documentation style, audience
- **Output**: Markdown documentation, examples, API reference
- **Best for**: API docs, README files, integration guides
- **Version**: v1.0
- **Location**: `v1.0/templates/documentation.prompt`

#### 6. **api-docs.prompt** ⭐⭐⭐⭐

- **Purpose**: Generate REST API documentation
- **Input**: EndpointController, HTTP methods, status codes
- **Output**: Swagger/OpenAPI format, curl examples
- **Best for**: API documentation, client generation
- **Version**: v1.0
- **Location**: `v1.0/templates/api-docs.prompt`

#### 7. **readme.prompt** ⭐⭐⭐⭐

- **Purpose**: Generate comprehensive README
- **Input**: Project structure, features, setup steps
- **Output**: Complete README with TOC, examples, troubleshooting
- **Best for**: Project documentation, onboarding
- **Version**: v1.0
- **Location**: `v1.0/templates/readme.prompt`

---

### Testing (3 prompts)

#### 8. **testing.prompt** ⭐⭐⭐⭐⭐

- **Purpose**: Generate unit test cases
- **Input**: Method/function, test framework, coverage goals
- **Output**: Test class with happy path & edge cases
- **Best for**: Unit testing, TDD workflows
- **Version**: v1.0
- **Location**: `v1.0/templates/testing.prompt`

#### 9. **integration-test.prompt** ⭐⭐⭐⭐

- **Purpose**: Generate integration test scenarios
- **Input**: MultipleComponents/Services, workflows
- **Output**: Integration test cases, setup/teardown
- **Best for**: Integration testing, workflow verification
- **Version**: v1.0
- **Location**: `v1.0/templates/integration-test.prompt`

#### 10. **e2e-test.prompt** ⭐⭐⭐

- **Purpose**: Generate end-to-end test scenarios
- **Input**: User workflows, happy path & exceptions
- **Output**: Behave/Gherkin scenarios or E2E test code
- **Best for**: E2E testing, regression testing
- **Version**: v1.0
- **Location**: `v1.0/templates/e2e-test.prompt`

---

### Design & Architecture (3 prompts)

#### 11. **tech-design.prompt** ⭐⭐⭐⭐⭐

- **Purpose**: Design technical solutions
- **Input**: Problem, constraints, success criteria
- **Output**: Design proposal with diagrams, trade-offs, implementation plan
- **Best for**: Architecture decisions, design reviews
- **Version**: v1.0
- **Location**: `v1.0/templates/tech-design.prompt`

#### 12. **api-design.prompt** ⭐⭐⭐⭐

- **Purpose**: Design REST API contracts
- **Input**: Feature requirements, entities, operations
- **Output**: API endpoints, request/response DTOs, status codes
- **Best for**: API contract design, OpenAPI specs
- **Version**: v1.0
- **Location**: `v1.0/templates/api-design.prompt`

#### 13. **database-design.prompt** ⭐⭐⭐⭐

- **Purpose**: Design database schema
- **Input**: Entities, relationships, access patterns
- **Output**: Entity diagrams, migrations, indexes
- **Best for**: Database schema, performance tuning
- **Version**: v1.0
- **Location**: `v1.0/templates/database-design.prompt`

---

### Analysis (2 prompts)

#### 14. **requirements-analysis.prompt** ⭐⭐⭐⭐⭐

- **Purpose**: Break down requirements into tasks
- **Input**: Feature description, acceptance criteria
- **Output**: Task breakdown, effort estimates, dependencies
- **Best for**: Sprint planning, feature breakdown
- **Version**: v1.0
- **Location**: `v1.0/templates/requirements-analysis.prompt`

#### 15. **code-analysis.prompt** ⭐⭐⭐⭐

- **Purpose**: Analyze code quality metrics
- **Input**: Code file(s), quality standards
- **Output**: Quality report, improvement suggestions
- **Best for**: Code health evaluation, debt quantification
- **Version**: v1.0
- **Location**: `v1.0/templates/code-analysis.prompt`

---

## Prompt Workflows (Complex Tasks)

**Workflows chain multiple prompts for complex scenarios.**

| Workflow            | Prompts                                             | Purpose                             |
| ------------------- | --------------------------------------------------- | ----------------------------------- |
| Code Review → Tests | code-review → testing                               | Review code, generate missing tests |
| Feature → Doc       | requirements-analysis → tech-design → documentation | Full feature documentation          |
| Bug → Fix → Test    | code-analysis → refactoring → testing               | Bug fix with tests                  |
| Refactor Cycle      | code-analysis → refactoring → testing → code-review | Safe refactoring                    |
| Security Hardening  | security-audit → code-review → testing              | Security improvement cycle          |

**See**: `PROMPT_CHAINING.md` for detailed workflow examples

---

## By Language/Framework

### C# (.NET) Prompts

- `code-review.prompt` (C# specific examples)
- `testing.prompt` (xUnit, NUnit examples)
- `refactoring.prompt` (C# patterns)
- `security-audit.prompt` (ASP.NET security)
- `documentation.prompt` (XML doc generation)

### TypeScript (Angular) Prompts

- `code-review.prompt` (TypeScript specific)
- `testing.prompt` (Jasmine, Karma examples)
- `refactoring.prompt` (Angular patterns)
- `documentation.prompt` (TSDoc generation)

### Database Prompts

- `database-design.prompt` (SQL Server schemas)
- `performance-analysis.prompt` (Query optimization)
- `security-audit.prompt` (SQL injection prevention)

---

## Using This Index

### Find by Task

1. Look at "Quick Find" table above
2. Click on prompt name
3. See full details below

### Find by Language

1. Scroll to "By Language/Framework"
2. See recommended prompts
3. Customize with your language specifics

### Find by Workflow

1. Scroll to "Prompt Workflows"
2. See multi-step complex tasks
3. Use `PROMPT_CHAINING.md` for details

---

## Template Summary

| #   | Name                  | Complexity | Uses        |
| --- | --------------------- | ---------- | ----------- |
| 1   | code-review           | ⭐⭐⭐     | Very Common |
| 2   | documentation         | ⭐⭐       | Very Common |
| 3   | testing               | ⭐⭐⭐     | Very Common |
| 4   | tech-design           | ⭐⭐⭐⭐   | Common      |
| 5   | requirements-analysis | ⭐⭐       | Common      |
| 6   | refactoring           | ⭐⭐⭐     | Moderate    |
| 7   | security-audit        | ⭐⭐⭐⭐⭐ | Moderate    |
| 8   | performance-analysis  | ⭐⭐⭐⭐   | Moderate    |
| 9   | api-design            | ⭐⭐⭐     | Moderate    |
| 10  | api-docs              | ⭐⭐       | Moderate    |
| 11  | database-design       | ⭐⭐⭐⭐   | Occasional  |
| 12  | integration-test      | ⭐⭐⭐⭐   | Occasional  |
| 13  | e2e-test              | ⭐⭐⭐     | Occasional  |
| 14  | code-analysis         | ⭐⭐       | Occasional  |
| 15  | readme                | ⭐⭐       | Occasional  |

---

## Getting Started

**New to this system?**

1. Read `PHASE_9_PROMPT_LIBRARY_README.md` (5 min overview)
2. Use `code-review.prompt` on your next PR (immediate value)
3. Read `PROMPT_CHAINING.md` to chain prompts (advanced)
4. Read `PROMPT_TESTING.md` to validate quality (best practices)

**Team Lead?**

1. Customize prompts in `v1.1/` for your standards
2. Create test cases in `test-cases/` for validation
3. Share with team via repo
4. Collect feedback for `v1.2/`

---

## Star Ratings

⭐⭐⭐⭐⭐ = Essential, use constantly  
⭐⭐⭐⭐ = Very useful, regular use  
⭐⭐⭐ = Useful, periodic use  
⭐⭐ = Specialized, occasional use

---

**Version**: 1.0  
**Last Updated**: April 8, 2026  
**Prompts**: 15 core templates  
**Status**: ✅ Complete & Ready
