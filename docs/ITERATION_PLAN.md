# Iteration Plan

**Monthly iteration schedule and improvement cycle.**

---

## Monthly Iteration Calendar

### The 4-Week Cycle

```
Week 1: Collect          Gather data, surveys, feedback
Week 2: Analyze & Plan   Review metrics, identify improvements
Week 3: Build            Implement improvements
Week 4: Release & Review Close improvements, celebrate wins
```

---

## Week 1: Collect (Baseline & Feedback)

### Monday-Tuesday: Data Collection

**Monday 9:00 AM**:

- Send monthly survey (Google Form)
- Post Slack reminder: "Monthly AI feedback survey - 3 min, please complete"
- Goal: 100% response rate by end of day

**Tuesday 9:00 AM**:

- Compile survey responses
- Review GitHub metrics (auto-generated):
  ```
  - Commits per developer (velocity)
  - PR size trends (code review efficiency)
  - Test coverage (quality)
  - Security scan results
  ```

### Wednesday: 1-on-1 Feedback Sessions

**Schedule**:

```
9:00 AM  - Dev #1 (15 min)
9:30 AM  - Dev #2 (15 min)
10:00 AM - Dev #3 (15 min)
10:30 AM - Dev #4 (15 min)
11:00 AM - Dev #5 (15 min)
```

**Each session**:

- Ask about tool usage
- Identify blockers
- Capture improvement ideas
- Record in shared notes

### Thursday: Behavioral Data

**Manual Observation**:

```
- Review PR timestamps (when reviews happen)
- Check commit messages (Do they mention AI/tools?)
- Observe tool usage patterns
  - Copilot: When used? For what?
  - Prompts: Which templates used? How often?
  - Documentation: Is it complete? Is it used?
```

**Compile in Feedback Tracker**:

```
Week 1 Summary:
✓ Survey responses: 15/15 (100%)
✓ 1-on-1s completed: 5/5
✓ GitHub metrics: Compiled
✓ NPS score calculated: 35
✓ Ready for analysis
```

---

## Week 2: Analyze & Plan

### Monday: Analysis & Insights

**Task: Consolidate All Feedback**

```
Survey Results (Quantitative):
- NPS: 35 (target: 30+) ✅
- Adoption: 67% (target: 50+) ✅
- Satisfaction: 3.8/5 (target: 3.5+) ✅
- Time saved: 2.65 hr/week/dev

Key Questions:
- Which tools drive value?
- What's the biggest blocker?
- Who's adopting? Who's not? Why?
```

**1-on-1 Feedback (Qualitative)**:

```
Themes from conversations:
- Backend templates missing (3 devs mentioned)
- Learning curve steep (2 devs)
- Copilot great for tests (4 devs)
- Documentation prompt sometimes incomplete (1 dev)
- Setup friction for new members (2 devs)
```

**GitHub Metrics (Behavioral)**:

```
Velocity trend:
- March: 30 points
- April: 32 points (✓ +7%)
- Target Month 3: 35 points

Code review time:
- March: ~8 min average
- April: ~6 min average (✓ -25%)
- Target Month 3: 5 min

Test coverage:
- March-April: 100% maintained ✅
```

### Tuesday: Prioritize Improvements

**Matrix Analysis**:

| Improvement            | Feedback Count | Expected Impact | Effort          | Priority |
| ---------------------- | -------------- | --------------- | --------------- | -------- |
| **Backend templates**  | 3 devs         | High (blocking) | Medium (2 days) | 🔴 #1    |
| **Video tutorials**    | 2 devs         | High (learning) | Medium (1 day)  | 🟡 #2    |
| **Onboarding docs**    | 2 devs         | Medium          | Low (4 hours)   | 🟡 #2    |
| **Error messages**     | 1 dev          | Low             | High            | 🟢 #3    |
| **Edge case examples** | 1 dev          | Medium          | Low (4 hours)   | 🟡 #2    |

**Decision**:

```
Top 3 Improvements for May:
1. Create 5 backend template examples (owner: Dev#1)
2. Record 3 video tutorials (owner: Dev#2)
3. Improve onboarding guide (owner: Lead)

Timeline: All by May 31
```

### Wednesday: Plan Execution

**Create Work Items**:

```
Improvement #1: Backend Templates
├─ Title: "Create backend-specific prompt templates"
├─ Description: Service templates, repo templates, migration templates
├─ Owner: Dev#1
├─ Due: May 31
├─ Success Criteria:
│  - 5 templates created
│  - Team uses in code
│  - Feedback incorporated
└─ Subtasks:
   - Template #1: Service method documentation (2 hours)
   - Template #2: Repository pattern (2 hours)
   - Template #3: Database migration docs (2 hours)
   - Template #4: API endpoint docs (2 hours)
   - Template #5: Unit test generator (2 hours)

Improvement #2: Video Tutorials
├─ Title: "Create video walkthroughs for prompt templates"
├─ Description: 3 videos (3-5 min each) on using different prompts
├─ Owner: Dev#2
├─ Due: May 15
├─ Success Criteria:
│  - 3 videos recorded
│  - Posted to internal Wiki
│  - Feedback gathered
└─ Subtasks:
   - Video 1: "Using code-review.prompt" (1.5 hours)
   - Video 2: "Using testing.prompt" (1.5 hours)
   - Video 3: "Using documentation.prompt" (1.5 hours)

Improvement #3: Onboarding Guide
├─ Title: "Improve new developer onboarding"
├─ Description: Step-by-step guide with video links
├─ Owner: Lead
├─ Due: May 10
├─ Success Criteria:
│  - New hire completes in <1 hour
│  - Quick-start working
│  - Links to all docs
└─ Subtasks:
   - Update QUICKSTART.md (1 hour)
   - Add video links (30 min)
   - Test with new hire (30 min)
```

### Thursday: Team Sync

**Meeting (15 min)**: Communicate improvements

```
Agenda:
1. "Here's what we heard from you:" (summary)
2. "Here's what we're doing:" (improvements)
3. "Timeline & owners:" (expectations)
4. "Questions?" (engagement)

Slide:
┌─────────────────────────────────────┐
│ May Improvements (Based on Your     │
│ Feedback)                           │
│                                     │
│ 🔴 Backend Templates (Dev#1)        │
│    - Due: May 31                    │
│                                     │
│ 🟡 Video Tutorials (Dev#2)          │
│    - Due: May 15                    │
│                                     │
│ 🟡 Onboarding Guide (Lead)          │
│    - Due: May 10                    │
│                                     │
│ "Your feedback drives our           │
│ improvements!" ✅                   │
└─────────────────────────────────────┘
```

---

## Week 3: Build

### Monday-Thursday: Implementation

**Dev #1 Context** (Backend Templates):

```
Monday:  Research existing patterns, design template structure
Tuesday: Create 3 templates, get feedback
Wednesday: Refine based on team comments
Thu-Fri: Test with team, iterate
```

**Dev #2 Context** (Video Tutorials):

```
Monday: Plan video scripts, storyboards
Tuesday: Record videos 1-2
Wednesday: Record video 3, edit all
Thu-Fri: Post to Wiki, gather feedback
```

**Lead Context** (Onboarding Guide):

```
Monday: Review current guide, identify gaps
Tuesday: Rewrite with video links, examples
Wednesday: Test with mock new hire
Thu-Fri: Finalize, get team feedback
```

### Ongoing: Daily Standup Updates

**Format** (Slack message, daily 9 AM):

```
Dev#1: ✅ Backend templates
- Yesterday: Designed service template + repo template
- Today: Create 3 more, gather feedback
- Blocker: None

Dev#2: ✅ Videos
- Yesterday: Recorded 2 videos, initial edit
- Today: Record video 3, full edit, upload
- Blocker: Need recording software advice

Lead: ✅ Onboarding
- Yesterday: Updated guide, added links
- Today: Test with mock new hire, finalize
- Blocker: None
```

### Optional: Pair Review

**Thursday 3 PM**: Quick review of improvements

```
Agenda:
1. Backend templates: Does team like them?
2. Video tutorials: Are they clear and useful?
3. Onboarding: Does new hire feel supported?

Feedback incorporated before Friday release.
```

---

## Week 4: Release & Review

### Monday: Final Release Preparation

**Dev #1 - Backend Templates**:

```
Task: Finalize & commit templates
├─ Final review with team
├─ Add to v1.0/ directory
├─ Update LIBRARY_INDEX.md
├─ Commit: "May: Backend-specific prompt templates"
└─ PR for team approval
```

**Dev #2 - Video Tutorials**:

```
Task: Post videos & documentation
├─ Videos uploaded to Wiki
├─ Links added to QUICKSTART.md
├─ Email team: "New resources available!"
└─ Slack: Share links in #ai-tools
```

**Lead - Onboarding Guide**:

```
Task: Deploy new guide
├─ Update all entry points
├─ Link from README
├─ Announce to team
├─ Plan for next new hire to test
```

### Tuesday: Celebration & Metrics Update

**Team Meeting (20 min)**: Celebrate Improvements

```
Agenda:
1. "You asked, we delivered!" (show improvements)
2. Demo: "Here's what's new" (live walkthrough)
3. Early feedback: "Let's hear from early adopters"
4. Recognition: Celebrate team effort 👏

Talking points:
- 3 feedback items → 3 improvements delivered
- Timeline: All on schedule ✅
- Quality: Team reviewed & approved
- Impact: Expect better adoption next month
```

### Wednesday: Metrics Dashboard Update

**Update Feedback Tracker with Initial Impact**:

```
May 2026 Metrics (Preliminary)
├─ Improvements released:
│  ✅ Backend templates - Live
│  ✅ Video tutorials - Live
│  ✅ Onboarding guide - Live
├─ Initial feedback:
│  - "Backend templates exactly what I needed!" (Dev#3)
│  - "Videos are super helpful" (Dev#4)
│  - "New guide is much clearer" (Lead feedback)
├─ Plans for June:
│  - Full metrics after full month of usage
│  - Expect adoption to increase
└─ Next survey: June 1st
```

### Thursday: Planning for Next Cycle

**Meta-Question: Is the process working?**

```
Reflect:
- Did we prioritize feedback correctly?
- Were timelines realistic?
- Did improvements deliver expected value?
- Any process improvements needed?

Example insights:
- "Backend templates should have videos" (combine feedback)
- "Dev#1 could use better template documentation" (support)
- "Timeline was tight, consider 2-week improvements" (planning)
```

### Friday: Cleanup & Next Week Prep

**Friday Afternoon Tasks**:

```
1. Archive May improvements (move to archive/v1.1/)
2. Update CHANGELOG.md with May changes
3. Commit: "May improvements: templates, videos, docs"
4. Push to main branch
5. Sync with team on next week's survey

Ready for Week 1 (June) - Collect phase
```

---

## Iteration Template: Copy & Customize

### Month: [May/June/July/etc]

**Week 1 (Collect)**:

- [ ] Send survey (Monday)
- [ ] Compile Google Form responses
- [ ] Schedule 1-on-1s (Tuesday)
- [ ] Complete 1-on-1 calls
- [ ] Gather GitHub metrics
- [ ] Initial dashboard update

**Week 2 (Analyze & Plan)**:

- [ ] Analyze survey results
- [ ] Identify themes from 1-on-1s
- [ ] Create priority matrix
- [ ] Team meeting to discuss
- [ ] Create work items for improvements

**Week 3 (Build)**:

- [ ] Daily standup updates
- [ ] Implement improvements
- [ ] Gather feedback during development
- [ ] Iterate based on team input

**Week 4 (Release)**:

- [ ] Finalize all improvements
- [ ] Release/deploy
- [ ] Celebrate with team
- [ ] Update metrics dashboard
- [ ] Prepare for next cycle

---

## Running Multiple Iterations: 6-Month Plan

```
Apr 2026: Iteration 1 (Establish patterns)
│
May 2026: Iteration 2 (Refine based on April feedback)
│
Jun 2026: Iteration 3 (Consolidate learning)
│
Jul 2026: Iteration 4 (Expand to new areas)
│
Aug 2026: Iteration 5 (Optimize & scale)
│
Sep 2026: Iteration 6 (Look back & plan next phase)
```

**Cumulative Improvements**:

```
After 6 months: ~18 improvements based on feedback
Expected outcome: System refined, team mastery, ROI proven
```

---

## Tracking Across Iterations

**Cumulative Tracker**:

| Month | Improvements                | Data Points | NPS | Adoption | Velocity | Notes                |
| ----- | --------------------------- | ----------- | --- | -------- | -------- | -------------------- |
| Apr   | 0 (baseline)                | Collected   | 35  | 67%      | +5%      | Baseline             |
| May   | 3 (templates, videos, docs) | Collected   | 40  | 75%      | +10%     | Early success        |
| Jun   | 3 (TBD)                     | Collected   | 50  | 85%      | +15%     | Month 3 target ✅    |
| Jul   | 3 (TBD)                     | Collected   | 58  | 90%      | +20%     | Beyond targets       |
| Aug   | 3 (TBD)                     | Collected   | 65  | 92%      | +25%     | Plateau with quality |
| Sep   | 3 (TBD)                     | Collected   | 72  | 95%      | +28%     | Optimization phase   |

---

**Status**: ✅ Ready to Use  
**Updated**: April 8, 2026
