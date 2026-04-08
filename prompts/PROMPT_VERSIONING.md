# Prompt Versioning & Changelog System

**Framework** for versioning and tracking prompt evolution.  
**Updated**: April 8, 2026 | **Status**: ✅ Active

---

## Versioning Strategy

### Semantic Versioning for Prompts

Prompts follow **semantic versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR.0.0**: Breaking changes (output format changes, structure changes)
- **MAJOR.MINOR.0**: New features, enhancements (output improvements, new parameters)
- **MAJOR.MINOR.PATCH**: Bug fixes, clarifications (no output changes)

### Version Directories

```
prompts/
├── v1.0/                  # Current stable
├── v1.1/                  # Next minor release (in development)
├── v2.0-draft/            # Next major release (planning)
├── archive/
│   ├── v0.9/              # Previous versions (archive)
│   └── v0.8/
└── CHANGELOG.md           # Master changelog
```

### Version Lifecycle

```
Development → Beta → Release Candidate → Stable → Legacy → Archive

v2.0-draft   v2.0-beta      v2.0-rc1        v2.0      v1.0 (legacy)
   (team)     (trusted users)  (final review) (deployed) (still used)
```

---

## File Structure

### Current Stable Version (v1.0)

```
v1.0/
├── templates/
│   ├── code-review.prompt
│   ├── documentation.prompt
│   └── ... (all templates)
├── workflows/
│   ├── code-review-to-tests.workflow
│   └── ... (all workflows)
└── MANIFEST.md            # v1.0 summary
```

### Development Version (v1.1)

```
v1.1/
├── templates/
│   └── code-review.prompt  (improved version)
├── workflows/
└── MANIFEST.md            # What's new in v1.1
```

### Archive

```
archive/
├── v0.9/                   # Old version, no longer used
├── v0.8/                   # Older version
└── README.md               # How to access old versions
```

---

## Creating a New Version

### Step 1: Copy Current Version

```bash
Copy-Item -Path "prompts/v1.0" -Recurse -Destination "prompts/v1.1"
```

### Step 2: Make Changes

Edit templates in `v1.1/templates/`

### Step 3: Update Manifest

Create/update `v1.1/MANIFEST.md`:

```markdown
# Version 1.1 Manifest

**Release Date**: April 15, 2026
**Stability**: Stable
**Breaking Changes**: None

## What's New

### Improvements

- Enhanced code-review.prompt with security focus
- Better parameter documentation
- New workflow: refactor-cycle.workflow

### Bug Fixes

- Fixed grammar in documentation.prompt
- Improved test-generation output format

### Deprecations

- None

## Migration from v1.0

No breaking changes. Can switch anytime.

## Recommendations

- For new projects: use v1.1 (latest)
- For existing projects: v1.0 still supported
- Timeline: v1.0 support until April 2027

## Prompts Updated

- code-review.prompt (v1.0 → v1.1)
- documentation.prompt (v1.1 new)
```

### Step 4: Update CHANGELOG.md

Add entry at top of global changelog

### Step 5: Update Import Statements

In scripts/workflows, update version references:

```powershell
# OLD
$prompt = Get-Content "prompts/v1.0/templates/code-review.prompt"

# NEW
$prompt = Get-Content "prompts/v1.1/templates/code-review.prompt"
```

### Step 6: Test Version

Use `PROMPT_TESTING.md` framework to validate all prompts

### Step 7: Archive Old Version (if moving on)

```bash
Move-Item -Path "prompts/v1.0" -Destination "prompts/archive/v1.0"
```

---

## CHANGELOG.md Template

```markdown
# Prompt Library Changelog

All notable changes to prompts are documented here.

## Versioning

- **v1.0**: Initial release (April 8, 2026)
- **v1.1**: Small improvements (April 15, 2026)
- **v2.0**: Planned major update (June 2026)

---

## [v1.1] - 2026-04-15

### Added

- New `refactor-cycle.workflow` for safe refactoring
- Parameter templates for team customization
- Test generation with edge case discovery

### Changed

- Improved `code-review.prompt` with security section
- Enhanced organization isolation checks in backend prompts
- Better async/await pattern examples

### Fixed

- Grammar corrections in `documentation.prompt`
- Missing error handling examples in `testing.prompt`
- Typos in API design prompts

### Deprecated

- `code.prompt` (old name, use `code-review.prompt`)

### Security

- Added OWASP checks to `security-audit.prompt`
- Enhanced SQL injection prevention in database prompts

### Testing

- All 15 prompts tested (100% pass rate)
- 47 test cases with >90% coverage

### Migration Guide
```

# Simple migration from v1.0 to v1.1

1. Backup v1.0 if needed
2. Replace v1.0/templates with v1.1/templates
3. All scripts still work (backward compatible)

```

---

## [v1.0] - 2026-04-08

### Added
- Initial 15 prompt templates
- Code review, documentation, testing, design
- 5 chaining workflows
- Testing framework with validation
- PowerShell execution scripts

### Status
- ✅ Production ready
- ✅ All tests passing (175/175)
- ✅ Team ready

---

## Future Roadmap

### v1.2 (April 22, 2026)
- Advanced chaining workflows
- AI agent integration
- Performance optimization

### v2.0 (June 1, 2026) - Major Release
- Restructured parameter system
- Built-in parameter validation
- GraphQL prompts
- Mobile development prompts

### v3.0 (September 2026) - Planned
- Automatic version detection
- Semantic parameter validation
- Built-in LLM integration
- Web UI for prompt management
```

---

## Version Pinning

### How to Use Specific Versions

#### In Scripts

```powershell
# Pin to v1.0
$version = "v1.0"
$prompt = Get-Content "prompts/$version/templates/code-review.prompt"

# Pin to v1.1
$version = "v1.1"
$prompt = Get-Content "prompts/$version/templates/code-review.prompt"
```

#### In Documentation

```markdown
# Using Code Review Prompt (v1.0)

Instructions for the v1.0 version of code-review.prompt...
```

#### In Configuration

```json
{
  "prompt_version": "v1.1",
  "prompts": {
    "code_review": "v1.1",
    "testing": "v1.1",
    "documentation": "v1.0"
  }
}
```

---

## Breaking Changes

### Example: v1.0 to v2.0 (Hypothetical)

**v1.0 Parameter**:

```
{PROJECT_CONTEXT}
{FILE_PATH}
{LANGUAGE}
```

**v2.0 Parameter** (Breaking!):

```
{CONTEXT_JSON}  # New structure
{FILE_PATH}     # Same
{LANGUAGE}      # Same
{STANDARDS}     # New required
```

**Migration Path**:

```
# v1.0 script
$params = @{
    PROJECT_CONTEXT = "... long description ..."
    FILE_PATH = "..."
}

# v2.0 script
$params = @{
    CONTEXT_JSON = @{ project_type = "backend"; framework = ".NET" } | ConvertTo-Json
    FILE_PATH = "..."
    STANDARDS = "v1.1"  # New!
}
```

---

## Support Lifecycle

### Active Support (18 months)

- Bug fixes
- Security patches
- Performance improvements
- Backward compatibility maintained

### Legacy Support (12 months)

- Security fixes only
- No new features
- Bug fixes on request

### Archive (No support)

- Historical reference only
- Available for legacy projects

### Example

```
v1.0: Active until Oct 2027, Legacy until Oct 2028
v1.1: Active until Nov 2027, Legacy until Nov 2028
v2.0: Active until Jun 2028, Legacy until Jun 2029
```

---

## Updating Your Prompts

### Minor Change (v1.0 → v1.0.1)

Example: Fix grammar in code-review.prompt

```bash
1. Edit prompts/v1.0/templates/code-review.prompt
2. Update CHANGELOG.md (add v1.0.1 section)
3. Run tests: .\scripts\validate-prompt.ps1
4. Commit with message: "Fix: grammar in code-review.prompt v1.0.1"
5. Push to main
```

### Feature Addition (v1.0 → v1.1)

Example: Add new refactoring workflow

```bash
1. Create prompts/v1.1/ directory
2. Copy all from v1.0 to v1.1
3. Add new prompts/workflows to v1.1
4. Create v1.1/MANIFEST.md
5. Update CHANGELOG.md
6. Test all v1.1 prompts
7. Commit: "Feature: v1.1 with refactoring workflow"
8. Push to main
```

### Major Change (v1.0 → v2.0)

Example: Restructure prompt parameters

```bash
1. Create prompts/v2.0-draft/ directory
2. Redesign templates with new structure
3. Create extensive MANIFEST.md with migration guide
4. Create test cases in test-cases/v2.0-tests/
5. Run beta testing with trusted team members
6. Collect feedback and iterate
7. Move to v2.0-rc1 for final review
8. Move to v2.0 when stable
9. Archive v1.x
10. Update docs with migration path
```

---

## Best Practices

✅ **DO**:

- Increment version on any change
- Document all changes in CHANGELOG.md
- Test thoroughly before releasing
- Maintain backward compatibility when possible
- Keep old versions available in archive/
- Pin version in critical scripts
- Communicate breaking changes clearly

❌ **DON'T**:

- Overwrite old versions (always archive)
- Use `latest` version without testing
- Make breaking changes in minor releases
- Skip changelog entries
- Leave drafts without status labels
- Abandon old versions without notice

---

## Version Status Badges

Use these in documentation:

```markdown
- ![Stable](https://img.shields.io/badge/version-1.0-green) v1.0: Stable
- ![Beta](https://img.shields.io/badge/version-1.1--beta-blue) v1.1: Beta
- ![Draft](https://img.shields.io/badge/version-2.0--draft-orange) v2.0: Draft
```

---

## Summary

**Semantic Versioning**: MAJOR.MINOR.PATCH  
**Directories**: v1.0/, v1.1/, v2.0-draft/, archive/  
**Tracking**: CHANGELOG.md + MANIFEST.md per version  
**Support**: Active (18mo) → Legacy (12mo) → Archive  
**Compatibility**: Maintain backward compatibility in minor releases

---

**Status**: ✅ Active  
**Updated**: April 8, 2026  
**Current Version**: v1.0  
**Next Version**: v1.1 (planned April 15)
