# Metrics & KPIs

**Specific metrics and KPIs to track AI-assisted development success.**

---

## KPI Dashboard Summary

### The 12 Core KPIs

| ID  | KPI                     | Baseline | Month 3 | Month 6 | ROI Metric         |
| --- | ----------------------- | -------- | ------- | ------- | ------------------ |
| 1.  | **Adoption Rate**       | 0%       | 80%     | 90%     | Driving factors    |
| 2.  | **Team NPS**            | N/A      | 50+     | 65+     | Satisfaction       |
| 3.  | **Code Review Time**    | 30 min   | 5 min   | 4 min   | 6x faster          |
| 4.  | **Test Authoring Time** | 60 min   | 10 min  | 7 min   | 8x faster          |
| 5.  | **Doc Completion**      | 50%      | 100%    | 100%    | Quality depth      |
| 6.  | **Test Coverage**       | 100%     | 100%    | 100%    | Quality maintained |
| 7.  | **Security Issues**     | 0        | 0       | 0       | No regressions     |
| 8.  | **Bug Escape Rate**     | 10/mo    | 7/mo    | 5/mo    | -50%               |
| 9.  | **Sprint Velocity**     | Baseline | +15%    | +25%    | More features      |
| 10. | **Refactor Time**       | 120 min  | 40 min  | 30 min  | 4x faster          |
| 11. | **Setup Friction**      | 4 hours  | 1 hour  | <30 min | Easier onboarding  |
| 12. | **Tool Learning Curve** | 8 hours  | 2 hours | 1 hour  | Easier adoption    |

---

## Adoption Metrics (KPIs 1-2)

### KPI #1: Adoption Rate

**Definition**: % of team actively using AI tools monthly

**Measurement**:

```
Active Users = Team members with >5 tool interactions/month
Adoption Rate = (Active Users / Total Team) × 100%
```

**Target Timeline**:

```
Month 1: >50% (Launch phase)
Month 2: >65% (Spreading usage)
Month 3: >80% (Normalized usage)
Month 4+: >85% (Steady state)
```

**Tracking Method**:

```
GitHub: Monitor commit messages for AI patterns
Surveys: "Did you use tools this month?" (Yes/No)
Copilot: Direct usage metrics (if available)
PRs: Code review timestamps during work hours
```

**Success Definition**:

- ✅ >80% of team using tools
- ✅ Tools integrated into daily workflow
- ✅ No major barriers to adoption
- ✅ New hires onboarded to tools within 24 hours

---

### KPI #2: Team NPS (Net Promoter Score)

**Definition**: Team satisfaction with AI tools (scale -100 to +100)

**Measurement**:

```
Question: "How likely would you recommend these AI tools to a colleague?"
Scale: 0-10

Promoters (9-10): Would recommend
Passives (7-8): Neutral
Detractors (0-6): Would not recommend

NPS = (# Promoters - # Detractors) / Total × 100
```

**Calculation Example**:

```
100 team members surveyed

Promoters (9-10): 70 people = 70%
Passives (7-8): 20 people = 20%
Detractors (0-6): 10 people = 10%

NPS = (70 - 10) / 100 × 100 = 60
Interpretation: "Good" (>50 is good, >70 is excellent)
```

**Target Timeline**:

```
Month 1: 30-40 (Growing interest)
Month 2: 40-50 (Positive feedback)
Month 3: 50-60 (Good satisfaction)
Month 6: 65+ (Very satisfied)
```

**Tracking Method**:

```
Monthly 1-question survey: "How likely 0-10?"
Open-ended follow-up: "Why that score?"
Identify detractors: "What would improve your experience?"
```

**Success Definition**:

- ✅ NPS >50 by Month 3
- ✅ Trending upward each month
- ✅ Detractors identified and addressed
- ✅ Clear feedback driving improvements

---

## Productivity Metrics (KPIs 3-6)

### KPI #3: Code Review Time

**Definition**: Time to complete one code review (peer review of PR)

**Measurement**:

```
Time per review = Reviewer time to read, understand, comment, and approve

Baseline (without AI): 30 minutes
Target (with AI): 5 minutes
Improvement: 6x faster
```

**How to Measure**:

```
Self-reported: "How long did this review take?"
- Without tools: 30 min (reading + understanding)
- With Copilot prompt: 5 min (AI highlights + minor comments)

GitHub timestamp: PR open → reviewer first comment
(Less precise but automatic)

Detailed tracking:
Week 1: 30 min, 28 min, 32 min (avg 30 min)
Week 2: 5 min, 6 min, 4 min (avg 5 min)
Improvement: 6x faster
```

**Calculation Example**:

```
Team: 5 developers
Reviews per developer per week: 2
Weekly reviews: 5 × 2 = 10 reviews

Baseline: 10 × 30 min = 300 min (5 hours/week)
With AI: 10 × 5 min = 50 min (0.8 hours/week)
Weekly savings: 4.2 hours per week

Monthly: 4.2 × 4 = 16.8 hours
Annual: 16.8 × 12 = 201.6 hours/developer

Team annual savings: 5 × 201.6 = 1,008 hours
Cost savings: 1,008 × $150/hr = $151,200/year
```

**Tracking Template**:

```
Review Date | Task | Baseline (min) | With AI (min) | Time Saved
4/8/2026    | API review | 30 | 5 | 25
4/9/2026    | Service review | 28 | 6 | 22
4/10/2026   | UI review | 32 | 4 | 28
Average     | | 30 | 5 | 25 (83% faster)
```

**Success Definition**:

- ✅ Code reviews 80% faster by Month 3
- ✅ Quality of reviews maintained or improved
- ✅ No regressions in missed issues

---

### KPI #4: Test Authoring Time

**Definition**: Time to write a complete test suite for a feature

**Measurement**:

```
Time to write tests = From feature understanding to tests passing
(Includes: test design, code authoring, debugging, coverage analysis)

Baseline (without AI): 60 minutes
Target (with AI template + Copilot): 10 minutes
Improvement: 6x faster
```

**How to Measure**:

```
Self-reported time log:
Start: Read feature requirements (5 min prep)
Write tests with template: 55 minutes
→ Subtotal: 60 minutes (baseline)

With AI:
Start: Read feature requirements (5 min prep)
Open testing.prompt template: 1 minute
Generate test structure: 2 minutes
Debug & refine: 2 minutes
→ Subtotal: 10 minutes (with AI)
→ Savings: 50 minutes (83% faster)
```

**Calculation Example**:

```
Tests written per sprint: 20
Baseline per test: 60 min
With AI per test: 10 min

Sprint baseline: 20 × 60 = 1,200 min (20 hours)
Sprint with AI: 20 × 10 = 200 min (3.3 hours)
Sprint savings: 16.7 hours

Annual: (52 × 16.7) / 5 team = 174 hours/person
Cost: 174 × $150 = $26,100/developer
Team: 5 × $26,100 = $130,500/year
```

**Tracking Metric Options**:

**Option A: Time Self-Reporting**

```
Date | Feature | Tests Written | Time Taken | Notes
4/8  | Login   | 12 tests      | 15 min     | Used template
4/9  | Dashboard | 18 tests    | 12 min     | Template + Copilot
4/10 | Reports | 15 tests      | 18 min     | Complex logic
Avg  |         |               | 15 min     | 4x faster
```

**Option B: Tests Per Hour (Velocity)**

```
Baseline: 1 test per 10 minutes = 6 tests/hour
With AI: 1 test per 1.5 minutes = 40 tests/hour
Improvement: 6.7x more tests per hour
```

**Option C: Coverage Per Hour**

```
Baseline: 1% coverage per minute = 60% coverage/hour
With AI: 2.5% coverage per minute = 150% coverage/hour
(More comprehensive tests, faster)
```

**Success Definition**:

- ✅ Tests written 5-6x faster by Month 3
- ✅ Coverage maintained at 100%
- ✅ Test quality (edge cases) not compromised
- ✅ Adoption of testing.prompt template >70%

---

### KPI #5: Documentation Completion

**Definition**: % of public APIs with complete documentation

**Measurement**:

```
Complete Docs = Object description + Parameters + Return value + Example

Baseline: 50% of APIs documented
Target: 100% of APIs documented
```

**How to Count**:

```
Checklist for each public method:
[✓] Object/method description
[✓] All parameters documented
[✓] Return value documented
[✓] Example usage provided

If all 4 checked: Fully documented
If <4 checked: Incomplete
```

**Calculation Example**:

```
Backend API: 200 public methods

Baseline:
- Fully documented: 100 (50%)
- Incomplete: 100 (50%)

With AI (Month 3):
- Fully documented: 200 (100%)
- Incomplete: 0

Tool used: documentation.prompt
Time saved: 100 methods × 15 min = 1,500 min (25 hours)
```

**Tracking Method**:

```
GitHub Actions: Parse code comments, count completeness
Manual: Swagger UI shows % documented
Automated: SonarQube or similar

Dashboard:
Month 1: 50% documented
Month 2: 75% documented
Month 3: 100% documented ✅
```

**Success Definition**:

- ✅ 100% of public APIs documented
- ✅ Examples provided for complex methods
- ✅ Swagger generates from docs
- ✅ Developer onboarding faster (docs available)

---

### KPI #6: Test Coverage

**Definition**: % of code lines covered by tests

**Measurement**:

```
Coverage = (Lines executed by tests / Total lines) × 100%

Baseline: 100% (already achieved)
Target: Maintain 100%
```

**How to Measure**:

```
Run: dotnet test /p:CollectCoverage=true
Output: Coverage report showing % per component

Result: 100% coverage = All code paths tested
```

**Why This Matters**:

```
AI tools could generate code not covered by tests
This KPI ensures test coverage is NOT degraded

If coverage drops below 100%:
→ Problem: AI-generated code not fully tested
→ Solution: Enhance testing.prompt template
→ Result: Return to 100%
```

**Tracking Method**:

```
Run coverage on every release:
- April: 100%
- May: 100%
- June: 100%

Red flag: If ever <99%, investigate why
```

**Success Definition**:

- ✅ Maintain 100% coverage
- ✅ Zero regression in coverage
- ✅ New code always tested
- ✅ Edge cases covered

---

## Quality Metrics (KPIs 7-9)

### KPI #7: Security Issues

**Definition**: Count of security vulnerabilities found

**Measurement**:

```
Scan code for:
- Critical vulns (CVSS 9+): Must fix
- High vulns (CVSS 7-8): Should fix
- Medium vulns (CVSS 4-6): Nice to fix

Baseline: 0 critical issues
Target: 0 critical issues (no regressions)
```

**How to Measure**:

```
GitHub: Security scanning (automated)
SonarQube: Code quality + security
OWASP: Top 10 vulnerabilities
Manual: Security code review checklist

Example result:
Date: April
- Critical: 0
- High: 0
- Medium: 0
Grade: A+
```

**Red Flag**:

```
If AI-generated code introduces security issues:
→ Problem: Prompt didn't include security context
→ Solution: Add security checklist to .instructions files
→ Result: AI learns security patterns
```

**Success Definition**:

- ✅ 0 critical security issues
- ✅ 0 high-severity vulnerabilities
- ✅ Regular scanning (monthly)
- ✅ No security regressions from AI code

---

### KPI #8: Bug Escape Rate

**Definition**: Bugs found in production (after release)

**Measurement**:

```
Bugs Escaped = Defects reported by end-users
Rate = Bugs per month

Baseline: 10 bugs/month (before AI)
Target: 5 bugs/month (50% reduction)
By Month 6: 3 bugs/month (70% reduction)
```

**How to Measure**:

```
Track bug reports:
- Reported by: End-users, QA, testers
- Severity: Critical, High, Medium, Low
- Root cause: Missing test, bad design, unclear spec

Example log:
Month 1 (Pre-AI):  10 bugs reported
Month 2 (Early AI): 8 bugs reported
Month 3 (AI+docs): 6 bugs reported
Month 4: 5 bugs reported
Trend: Downward ✅
```

**Why AI Reduces Bugs**:

```
1. Better testing (testing.prompt generates comprehensive tests)
2. Better docs (documentation.prompt eliminates ambiguity)
3. Better code reviews (AI highlights issues faster)
4. Better design (tech-design.prompt prevents flaws early)

Combined: Fewer bugs escape to production
```

**Calculation Example**:

```
Baseline: 10 bugs/month
Target (Month 3): 5 bugs/month
Cost per bug fix: $500 (investigation + hot fix + regression testing)

Monthly savings: (10 - 5) × $500 = $2,500
Annual savings: $2,500 × 12 = $30,000
```

**Success Definition**:

- ✅ Bug escape rate -50% by Month 3
- ✅ Trending downward
- ✅ Better quality perception from users
- ✅ Fewer hotfixes needed

---

### KPI #9: Sprint Velocity

**Definition**: Features completed per sprint

**Measurement**:

```
Velocity = Story points completed per sprint

Baseline (current): X story points
Target (Month 3): X + 15%
By Month 6: X + 25%
```

**How to Measure**:

```
GitHub Projects / Jira:
- Track completed features per sprint
- Count story points or feature count
- Compare month-to-month

Example:
Sprint 1 (Pre-AI): 30 points
Sprint 2: 32 points
Sprint 3 (AI tools active): 35 points (+17%)
Sprint 4: 38 points (+27%)
Trend: Upward ✅
```

**Why Velocity Increases**:

```
1. Faster coding (Copilot suggests code)
2. Faster testing (templates + AI generation)
3. Faster reviews (quicker understanding)
4. Fewer bugs (better quality upfront)
5. Better docs (clearer requirements)

Combined: More features per sprint
```

**Calculation Example**:

```
Baseline velocity: 30 points/sprint
Target: 35 points/sprint (+17%)

Work hours per point: 8 hours
Baseline: 30 × 8 = 240 hours/sprint
Target: 35 × 8 = 280 hours (same effort, more output)

Alternative: Same features, 20% less effort
280 hours at same productivity = 34.4 points vs 30
Savings: 4.4 points × 8 = 35 hours/sprint = $5,250/sprint
Annual (26 sprints): 26 × $5,250 = $136,500
```

**Success Definition**:

- ✅ Velocity increases 15%+ by Month 3
- ✅ Sustainable pace (not burnout)
- ✅ Quality maintained (bugs don't increase)
- ✅ Team morale improves

---

## Experience Metrics (KPI 10-12)

### KPI #10: Refactor Time

**Definition**: Time to refactor code for clarity/efficiency

**Measurement**:

```
Refactor Time = Time from start to test-passing refactored code

Baseline: 120 minutes
Target: 40 minutes
Improvement: 3x faster
```

**How to Measure**:

```
Self-reported:
1. Identify code to refactor
2. Start timer
3. Use AI tools (Copilot + refactoring.prompt)
4. Stop timer when tests pass

Example:
Refactoring validation logic

Baseline (no AI): 120 min
- Analyze code: 30 min
- Write refactored code: 60 min
- Update tests: 20 min
- Debug: 10 min

With AI tools: 40 min
- Analyze with Copilot: 10 min
- Copilot suggests refactored code: 15 min
- Update tests with template: 10 min
- Run tests: 5 min
Savings: 80 min (67% faster)
```

**Calculation Example**:

```
Refactors per month: 4
Baseline: 4 × 120 = 480 min (8 hours)
With AI: 4 × 40 = 160 min (2.7 hours)
Savings: 5.3 hours/month

Annual: 5.3 × 12 = 63.6 hours
Cost: 63.6 × $150 = $9,540/year/developer
Team: 5 × $9,540 = $47,700/year
```

**Success Definition**:

- ✅ Refactoring 3x faster by Month 3
- ✅ Better code quality (maintainability)
- ✅ Technical debt reduced
- ✅ Developers prefer refactoring

---

### KPI #11: Setup Friction

**Definition**: Time for new team member to become productive

**Measurement**:

```
Setup Time = Time from project clone to first PR submitted

Baseline: 4 hours
Target (Month 3): 1 hour
Target (Month 6): 30 minutes
```

**What's Included**:

```
1. Clone repo (5 min)
2. Install dependencies (5 min)
3. Read project docs (30 min)
4. Understand code structure (15 min)
5. Set up IDE/tools (10 min)
6. Submit first PR (2 hours 35 min)

Total baseline: 4 hours

With AI improvements:
1. Clone repo (5 min)
2. Install dependencies (5 min)
3. Quick-start doc (5 min) ← Improved docs
4. Understand with AI (5 min) ← AI agent explains
5. Set up tools (2 min) ← Automated setup
6. Submit first PR (30 min) ← Templates + examples
Total: 50 minutes (saved 3.5 hours!)
```

**How to Measure**:

```
Track new hires:
New Hire #1: 4 hours (baseline)
New Hire #2: 3.5 hours (better docs)
New Hire #3: 1.5 hours (with AI tools)
New Hire #4: 50 min (Month 6 target)

Trend: Downward ✅
```

**Success Definition**:

- ✅ New onboarding <1 hour by Month 3
- ✅ Self-service docs sufficient
- ✅ AI agent answers questions
- ✅ Templates make first PR easy

---

### KPI #12: Tool Learning Curve

**Definition**: Time to proficiency with AI tools

**Measurement**:

```
Learning Time = Time from first exposure to confident daily use

Baseline: 8 hours (2 training sessions + practice)
Target (Month 3): 2 hours (quick training)
Target (Month 6): 1 hour (30-min onboarding + practice)
```

**What's Included**:

```
1. Setup tools (1 hour)
2. Watch intro video (20 min)
3. Try simple examples (30 min)
4. Get first positive result (30 min)
5. Integrate into workflow (5 hours)

Baseline total: 8 hours → Proficient

With improvements:
1. Setup tools (10 min) ← Automated
2. Watch quick intro (10 min) ← 5-minute video
3. Try template example (20 min) ← Templates provided
4. Use in real work (30 min) ← Build confidence

New total: 70 minutes → Proficient
Improvement: 6-7x faster learning
```

**How to Measure**:

```
Survey new users after training:
"How long until you felt confident using tools?"

Response tracking:
Month 1: Average 6-8 hours
Month 2: Average 3-4 hours
Month 3: Average 1-2 hours ← On target
Trend: Downward ✅
```

**Success Definition**:

- ✅ Learning time <2 hours by Month 3
- ✅ <1 hour by Month 6
- ✅ Self-service materials sufficient
- ✅ No formal training needed

---

## Summary: 12 KPIs with Targets

| KPI                | Month 1 | Month 3  | Month 6  | Status  |
| ------------------ | ------- | -------- | -------- | ------- |
| 1. Adoption Rate   | 50%     | 80%      | 90%      | Setup   |
| 2. Team NPS        | 35      | 50       | 65       | Monitor |
| 3. Code Review     | 5 min   | Maintain | Maintain | Measure |
| 4. Test Time       | 10 min  | Maintain | 7 min    | Measure |
| 5. Doc Completion  | 75%     | 100%     | 100%     | Track   |
| 6. Test Coverage   | 100%    | 100%     | 100%     | Monitor |
| 7. Security Issues | 0       | 0        | 0        | Scan    |
| 8. Bug Escape      | 8/mo    | 5/mo     | 3/mo     | Track   |
| 9. Sprint Velocity | +5%     | +15%     | +25%     | Measure |
| 10. Refactor Time  | 70 min  | 40 min   | 30 min   | Measure |
| 11. Setup Friction | 2 hr    | 1 hr     | 30 min   | Track   |
| 12. Learning Curve | 4 hr    | 2 hr     | 1 hr     | Track   |

---

**Status**: ✅ Ready to Use  
**Updated**: April 8, 2026
