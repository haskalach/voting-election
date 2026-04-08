# Feedback System

**How to collect, organize, and act on team feedback.**

---

## Feedback Collection Strategy

### Three Feedback Channels

1. **Quantitative** (Numbers)
   - NPS score: 0-10 scale
   - Adoption metrics: % using tools
   - Time savings: Minutes saved per task
2. **Qualitative** (Text)
   - "What's your biggest frustration?"
   - "What worked really well?"
   - "One thing to improve?"
3. **Behavioral** (Actions)
   - Tool usage frequency
   - Code review participation
   - Time spent in different tools

### Monthly Feedback Collection Calendar

```
Week 1: Collect data
Week 2: Consolidate & analyze
Week 3: Plan improvements
Week 4: Release improvements & celebrate wins
```

---

## Monthly Developer Survey

**Send**: First week of each month  
**Duration**: 3 minutes  
**Responses**: 100% of team (15 questions)

### The 15-Question Survey

**Section A: Adoption (Questions 1-3)**

```
1. How many times did you use AI tools this month?
   [ ] 0 times (not using)
   [ ] 1-5 times (trying)
   [ ] 6-10 times (using)
   [ ] 10+ times (daily user)

2. Which tools did you use most?
   [ ] GitHub Copilot
   [ ] Prompts (code-review, testing, docs)
   [ ] Both equally
   [ ] Neither (not used)

3. Rate ease of use: 1-5 scale
   [ ] 1 - Very difficult
   [ ] 2 - Difficult
   [ ] 3 - Neutral
   [ ] 4 - Easy
   [ ] 5 - Very easy
```

**Section B: Value (Questions 4-6)**

```
4. How much value do AI tools deliver? 1-5 scale
   [ ] 1 - No value
   [ ] 2 - Little value
   [ ] 3 - Some value
   [ ] 4 - Good value
   [ ] 5 - Excellent value

5. Which tasks improved most?
   [ ] Code reviews (faster feedback)
   [ ] Testing (faster test writing)
   [ ] Documentation (complete docs)
   [ ] Refactoring (cleaner code)
   [ ] Other: ________

6. Estimated time saved per week:
   Hours: [__] (0-10)
   "I saved about __ hours this month"
```

**Section C: Satisfaction (Questions 7-10)**

```
7. How satisfied are you with AI tools? 1-5 scale
   [ ] 1 - Very unsatisfied
   [ ] 2 - Unsatisfied
   [ ] 3 - Neutral
   [ ] 4 - Satisfied
   [ ] 5 - Very satisfied

8. How likely would you recommend these tools to a colleague? 0-10 scale
   [__] (This is your NPS score this month)

9. Which features do you use most?
   [ ] Code suggestions (Copilot)
   [ ] Templates (review, testing, docs)
   [ ] Both equally
   [ ] Other: ________

10. Rate your confidence using tools: 1-5 scale
    [ ] 1 - Not confident
    [ ] 2 - Somewhat confident
    [ ] 3 - Neutral
    [ ] 4 - Confident
    [ ] 5 - Very confident
```

**Section D: Problems & Suggestions (Questions 11-15)**

```
11. Top frustration (check one):
    [ ] Hard to learn
    [ ] Doesn't fit my workflow
    [ ] Results not reliable
    [ ] Too slow
    [ ] Not enough examples
    [ ] Other: ________

12. Rank top barriers to adoption (1-3):
    ___ Not aware of tools
    ___ Takes too long to set up
    ___ No clear value for my work
    ___ Fear of security issues
    ___ Prefer manual work

13. What one feature would make tools 10x better?
    [Open text box - encourage specific ideas]

14. Should we invest more in:
    [ ] Better templates
    [ ] Better documentation
    [ ] Better integration with IDE
    [ ] Training & examples
    [ ] Other: ________

15. Any comments?
    [Large text box - open ended]
```

---

## Analysis Process (Week 2)

### Step 1: Compile Survey Results

**Tally Responses**:

```
Question 1: Tool usage
- 0 times: 2 people (13%)
- 1-5 times: 3 people (20%)
- 6-10 times: 5 people (33%)
- 10+ times: 5 people (33%)

Insight: 67% using tools regularly ✅
Action: Follow up with 13% not using
```

**Calculate NPS**:

```
Promoters (9-10): 8 people
Passives (7-8): 4 people
Detractors (0-6): 3 people

NPS = (8 - 3) / 15 × 100 = 33
Target: 50+ by Month 3
Status: On track ✅
```

### Step 2: Identify Themes

**Frustrations Theme Analysis**:

```
Q11 - Top frustration:
- Hard to learn: 4 votes ← PRIORITY #1
- Doesn't fit workflow: 2 votes
- Results not reliable: 1 vote
- Too slow: 0 votes
- Not enough examples: 3 votes

Action items:
1. Create better onboarding (addresses #1, #3)
2. Add more code examples (addresses #3)
3. Improve template clarity (supports #1)
```

**Suggestions Analysis**:

```
Q13 - What would make tools 10x better?
- "Simple templates for my backend tasks" (3 mentions)
- "Better error messages when prompts fail" (2 mentions)
- "Video tutorials for each prompt type" (2 mentions)
- "Integration with code reviews" (1 mention)

Priority ranking:
1. Backend-specific templates (3 votes)
2. Error messaging improvements (2 votes)
3. Video tutorials (2 votes)
```

### Step 3: Calculate Quantitative Insights

**Time Savings Analysis**:

```
Q6 - Hours saved per week:
Developer 1: 3 hours
Developer 2: 5 hours
Developer 3: 2 hours
Developer 4: 0 hours (not using)
Developer 5: 4 hours
Developer 6: 3.5 hours
Developer 7: 1 hour
Developer 8: 0 hours (not using)
Developer 9: 6 hours
Developer 10: 2 hours

Average: 2.65 hours/week/developer
Team total: 26.5 hours/week
Annual: 26.5 × 52 = 1,378 hours
Cost savings: 1,378 × $150 = $206,700/year
```

### Step 4: Create Dashboard Entry

**Monthly Dashboard Update**:

```
April 2026 Feedback Summary
├─ Response Rate: 15/15 (100%)
├─ NPS Score: 33 (Target: 30+) ✅
├─ Adoption Rate: 67% (Target: 50+) ✅
├─ Avg Satisfaction: 3.8/5 (Target: 3.5+) ✅
├─ Time Saved: 2.65 hr/week per dev
├─ Top Frustration: Learning curve (4 votes)
├─ Top Suggestion: Backend templates (3 votes)
└─ Action Items (for Week 3):
   1. Create backend template examples
   2. Improve onboarding documentation
   3. Add video walkthroughs
```

---

## Session Feedback: 1-on-1 Check-Ins

**When**: Monthly, 15-min calls with each developer  
**Purpose**: Deeper conversation about tools

### 1-on-1 Conversation Guide

**Opening (2 min)**:

```
"Thanks for taking time. I want to understand your experience with
AI tools we've rolled out. What's working best for you?"
```

**Tool Usage (3 min)**:

```
"I noticed you've used tools X times this month. Tell me about those..."
- How did they go?
- Any quick wins?
- Anything that didn't work?
```

**Impact (3 min)**:

```
"Do you feel like tools have made your work easier? How?"
- Has your code review time improved?
- Any regressions or issues?
- What would be most valuable for your role?
```

**Barriers (3 min)**:

```
"What's preventing you from using tools more?"
- Learning curve?
- Not relevant to your work?
- Integration issues?
- Any specific blockers?
```

**Ideas (2 min)**:

```
"If you could improve tools in one way, what would it be?"
"What kind of template or prompt would help you most?"
"Any training or documentation that would help?"
```

**Closing (2 min)**:

```
"Thanks for the feedback. I'm going to [specific action].
Can I follow up with you in 2 weeks?"
```

### Notes Template

```
Developer: [Name]
Date: [Date]
Usage This Month: [Count] times

Highlights:
- [Positive feedback point]
- [How tools helped]

Concerns:
- [Issue #1]
- [Issue #2]

Ideas:
- [Suggestion #1]
- [Suggestion #2]

Follow-up Action:
- [ ] Create [specific template/doc]
- [ ] [Other commitment]

Next Check-in: [Date]
```

---

## Team Retrospectives: Monthly All-Hands

**When**: Last week of month, 30 minutes  
**Attendees**: Entire team  
**Purpose**: Celebrate wins, discuss challenges, plan improvements

### Retro Agenda

**1. Wins & Celebrations (8 min)**

```
"Let's celebrate what worked!"

- Code review time decreased 30% ✅
- 100% documentation achieved ✅
- Zero security issues 3 months running ✅
- 67% adoption rate (target was 50%) ✅

Team applause and recognition 👏
```

**2. What's Working (5 min)**

```
"Call out what's working best for you?"

Facilitator writes on whiteboard:
- Testing template saves 50 min per test
- Copilot code suggestions are accurate
- Documentation.prompt generates great examples
- New hires onboarding in <1 hour

Theme: Focus on value delivered
```

**3. Challenges (8 min)**

```
"What's not working or frustrating?"

Facilitator writes:
- Learning curve steep for new tools
- Some prompts need more examples
- Integration with code review workflow could improve
- Error messages not helpful
- Documentation.prompt sometimes misses edge cases

Theme: Be specific, focus on solutions
```

**4. Improvement Planning (7 min)**

```
Highest-priority improvement from feedback:

Q: "What should we improve first?"
A: Create backend template examples (3 votes from survey)

Quick plan:
- Owner: [Developer]
- Timeline: By end of May
- Success: 5+ backend templates created, team uses them
- Check-in: Next month retro
```

**5. Action Commitments (2 min)**

```
"Here's what we'll do this month:"

1. Create backend template examples ← Top feedback
2. Improve onboarding docs ← Second priority
3. Add video walkthrough ← Third priority

"Questions? Concerns? Let's go build!"
```

---

## Feedback Tracking Spreadsheet

### Set Up Template

**File**: `Feedback-Tracker-2026.xlsx`  
**Location**: Shared folder (Google Drive / SharePoint)

### Sheet 1: Monthly Survey

```
Month   | NPS | Adoption | Satisfaction | Time/week | Top Issue    | Top Suggestion
--------|-----|----------|--------------|-----------|--------------|----------------
April   | 35  | 67%      | 3.8/5        | 2.65 hrs  | Learning     | Backend templates
May     | 42  | 75%      | 3.9/5        | 3.2 hrs   | Examples     | Video tutorials
June    | 50  | 82%      | 4.2/5        | 3.8 hrs   | Integration  | API improvements
```

### Sheet 2: Action Items

```
Item | From | Suggested | Owner | Target Date | Status | Complete By
-----|------|-----------|-------|-------------|--------|------------
Create backend templates | Q survey | April retro | Dev#1 | May 31 | In progress | Done ✅
Add video walkthroughs | 1-on-1 | April retro | Dev#2 | May 15 | Not started | -
Improve onboarding | Retro | April retro | Lead | May 10 | Blocked (need copy) | Done ✅
```

### Sheet 3: Feature Requests

```
Feature | Requested By | Priority | Month Requested | Month Completed | Notes
--------|--------------|----------|-----------------|-----------------|-------
Better error messages | 1-on-1 #3 | Medium | April | June | v1.1 improvements
API prompt template | Q survey | High | April | May | High demand
Code smell detection | Feature request | Low | April | - | Nice to have
```

---

## Decision-Making from Feedback

### The Feedback Loop

```
Collect (Week 1)
    ↓
Analyze (Week 2)
    ↓
Prioritize (Week 2)
    ↓
Plan (Week 3)
    ↓
Build (Week 3-4)
    ↓
Release (Week 4)
    ↓
Collect (Week 1 next month)
```

### Priority Matrix: What to Build First?

**Urgency vs Impact**:

```
              High Impact
                   ↑
                   |
      QUICK WIN    | DO FIRST
          Q4       | Q1
                   |
            ───────┼───────→ Urgency
                   |
   LOW PRIORITY    | DELEGATE
          Q3       | Q2
                   |
              Low Impact
```

**April Feedback Plotted**:

```
Backend templates → Q1 (High impact, High urgency)
   - 3 votes from survey + 2 from 1-on-1s
   - Blocks team from using tools
   - Owner: Dev#1, Target: End May

Video tutorials → Q1 (High impact, Medium urgency)
   - 2 votes, helps learning curve
   - Nice to have but not blocking
   - Owner: Dev#2, Target: Mid-May

Error messages → Q2 (Medium impact, Low urgency)
   - 1 vote, nice for UX
   - Not blocking adoption
   - Owner: Future, Timeline: Later

Integration → Q3 (Medium impact, Low urgency)
   - 1 vote, enhancement not blocker
   - Can wait until v2
```

---

## Success Criteria for Feedback System

✅ **Collection**: 100% team response to monthly survey  
✅ **Analysis**: Complete analysis by end of Week 2  
✅ **Speed**: Top feedback addressed within 30 days  
✅ **Visibility**: All team sees dashboard + action items  
✅ **Ownership**: Every action item has owner + deadline  
✅ **Follow-up**: Progress reported in next retro  
✅ **Impact**: Improvements visible in next month's survey

---

**Status**: ✅ Ready to Use  
**Updated**: April 8, 2026
