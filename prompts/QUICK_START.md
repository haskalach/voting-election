# Phase 9: Quick Start Guide

**Get started with prompt templates in 5 minutes.**

---

## 1. Find the Right Prompt (1 min)

Open [LIBRARY_INDEX.md](LIBRARY_INDEX.md)

Look for your task:

- Reviewing code? → `code-review.prompt`
- Writing tests? → `testing.prompt`
- Creating docs? → `documentation.prompt`
- Designing API? → `api-design.prompt`
- Security audit? → `security-audit.prompt`

---

## 2. Get the Template (1 min)

Navigate to: `prompts/v1.0/templates/{prompt-name}`

E.g., `prompts/v1.0/code-review.prompt`

---

## 3. Fill in Parameters (2 min)

Replace placeholders with your values:

```
{PROJECT_CONTEXT} = "Election Voting backend"
{FILE_PATH} = "backend/ElectionVoting.Application/Services/EmployeeService.cs"
{LANGUAGE} = "C#"
{STANDARDS_FILE} = ".instructions-backend.md"
{REVIEW_FOCUS} = "Security, Performance, Organization Isolation"
```

---

## 4. Use the Prompt (1 min)

**Option A: GitHub Copilot** (Easiest)

1. Open a code file in VS Code
2. Open the `.prompt` file in another tab
3. Ask Copilot in editor: "Review this code using the template in prompts/v1.0/code-review.prompt"
4. Copilot uses both files as context

**Option B: ChatGPT / Claude**

1. Copy the filled prompt template
2. Paste into ChatGPT/Claude
3. Get structured output
4. Copy result back into your docs

**Option C: PowerShell Script**

```powershell
.\scripts\run-prompt.ps1 -Template "code-review" -Parameters @{
    FILE_PATH = "backend/.../EmployeeService.cs"
    LANGUAGE = "C#"
    # ... other params
}
```

---

## Examples

### Example 1: Code Review (5 minutes total)

**Step 1**: Open template

```
prompts/v1.0/code-review.prompt
```

**Step 2**: Fill template

```
{PROJECT_CONTEXT} = "Election Voting backend (.NET Core 10)"
{FILE_PATH} = "backend/ElectionVoting.Application/Services/AuthService.cs"
{LANGUAGE} = "C#"
{STANDARDS_FILE} = ".instructions-backend.md"
{REVIEW_FOCUS} = "Security vulnerabilities, async patterns, error handling"
{ADDITIONAL_CONTEXT} = "This handles JWT token management and security tokens"
```

**Step 3**: Use with Copilot

- Open AuthService.cs
- Open code-review.prompt with filled parameters
- Ask: "Review this code for the issues mentioned in code-review.prompt"

**Result**: Professional code review in 2-3 minutes

---

### Example 2: Generate Tests (10 minutes total)

**Step 1**: Open template

```
prompts/v1.0/testing.prompt
```

**Step 2**: Fill template

```
{PROJECT_CONTEXT} = "Election Voting backend"
{CLASS_NAME} = "EmployeeService"
{FILE_PATH} = "backend/ElectionVoting.Application/Services/EmployeeService.cs"
{LANGUAGE} = "C#"
{TEST_FRAMEWORK} = "xUnit"
{METHODS_TO_TEST} = "
- CreateEmployeeAsync(CreateEmployeeDto)
- GetEmployeeByIdAsync(int)
- UpdateEmployeeAsync(int, UpdateEmployeeDto)
- DeleteEmployeeAsync(int)"
{COVERAGE_GOAL} = "95%"
{EDGE_CASES} = "
- Duplicate email
- Null name
- Organization isolation check"
```

**Step 3**: Use with Claude (better for long outputs)

- Copy filled template
- Paste into Claude chat
- Get complete test class

**Result**: Full test suite in 5 minutes

---

### Example 3: Chain Prompts (Feature Development)

Want: Requirements → Design → Tests → Docs

**Step 1**: requirements-analysis.prompt

```
Input: Feature "Voting Results Dashboard"
Output: Task breakdown, effort estimates
```

**Step 2**: tech-design.prompt

```
Input: Feature description + analysis output
Output: Architecture design, data models, endpoints
```

**Step 3**: testing.prompt

```
Input: Design + code
Output: Complete test suite
```

**Step 4**: documentation.prompt

```
Input: All above
Output: Comprehensive documentation
```

See [PROMPT_CHAINING.md](PROMPT_CHAINING.md) for complete examples.

---

## Common Tasks

### Task: I need to review a PR

1. **Use**: `code-review.prompt`
2. **Fill**: FILE_PATH, LANGUAGE, REVIEW_FOCUS
3. **Time**: 3-5 minutes to get thorough review
4. **Output**: Issues, severity, improvements, test gaps

### Task: I need to write tests

1. **Use**: `testing.prompt`
2. **Fill**: CLASS_NAME, METHODS_TO_TEST, EDGE_CASES
3. **Time**: 5-10 minutes to generate test class
4. **Output**: xUnit/Jasmine tests ready to integrate

### Task: I need to document an API

1. **Use**: `documentation.prompt`
2. **Fill**: NAME, TARGET_TYPE, AUDIENCE, INCLUDE_EXAMPLES
3. **Time**: 3-7 minutes to get Markdown docs
4. **Output**: Swagger-ready docs, examples, error cases

### Task: I need to design a feature

1. **Use**: `requirements-analysis.prompt` → `tech-design.prompt`
2. **Chain**: 2 prompts for complete solution
3. **Time**: 10-15 minutes for design
4. **Output**: Architecture, data model, endpoints

### Task: Security audit

1. **Use**: `security-audit.prompt`
2. **Fill**: FILE_PATH, focus on OWASP, injection, auth
3. **Time**: 5-10 minutes for audit
4. **Output**: Vulnerabilities, severity, fixes

---

## Pro Tips

✅ **Do these**:

1. Keep `.instructions-*.md` files nearby for reference
2. Use Template + Instructions together for best results
3. Start small (one simple prompt) to learn the system
4. Save outputs in your project docs
5. Version your custom adaptations (v1.1/v1.2)
6. Test output quality before using in production

❌ **Don't do these**:

1. Manually edit prompts every time (use parameters instead)
2. Use same prompt for 10 different tasks (there's a template for each)
3. Skip reading Standards reference (.instructions-\*.md)
4. Ignore output unless it's perfect (results are starting points)
5. Chain more than 5 prompts (too error-prone)

---

## FAQ

**Q: Can I use v1.0 prompts now?**
A: Yes! v1.0 is stable and production-ready.

**Q: How do I customize for my team?**
A: Copy v1.0/ → v1.1/, edit templates, test, commit.

**Q: Which LLM works best?**
A: Claude for code generation, GPT-4 for analysis, Copilot inline.

**Q: How long should each prompt take?**
A: 2-10 minutes depending on complexity (see Examples).

**Q: Can I share prompts with team?**
A: Yes! Entire `/prompts` directory is version-controlled in git.

**Q: What if output isn't perfect?**
A: Edit the prompt template and try again. Update CHANGELOG.md.

---

## Next Steps

1. ✅ You're reading this → Quick Start
2. 📖 Read [LIBRARY_INDEX.md](LIBRARY_INDEX.md) → Find prompts
3. 💡 Read [PROMPT_CHAINING.md](PROMPT_CHAINING.md) → Complex tasks
4. 🧪 Read [PROMPT_TESTING.md](PROMPT_TESTING.md) → Validate quality
5. 📝 Read [PROMPT_VERSIONING.md](PROMPT_VERSIONING.md) → Version your changes

---

## Where to Go for Help

- **Which prompt should I use?** → [LIBRARY_INDEX.md](LIBRARY_INDEX.md)
- **How do I chain prompts?** → [PROMPT_CHAINING.md](PROMPT_CHAINING.md)
- **How do I test quality?** → [PROMPT_TESTING.md](PROMPT_TESTING.md)
- **How do I version?** → [PROMPT_VERSIONING.md](PROMPT_VERSIONING.md)
- **Is it working?** → [test-cases/](test-cases/) directory
- **What's the history?** → [CHANGELOG.md](CHANGELOG.md)

---

**Phase 9**: ✅ Prompts Ready to Use  
**Time to Value**: ~5 minutes  
**Updated**: April 8, 2026
