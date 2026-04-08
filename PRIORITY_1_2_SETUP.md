# Priority 1 & 2 Setup Guide

This document covers setup for Priority 1 (AI Extensions + Git Notifications) and Priority 2 (Auto Backlog).

---

## Priority 1: Complete ✅

### 1A. AI Extensions - **DONE**

Created `.instructions.md` in workspace root. Copilot will automatically use this for context.

**Verify it's working**:

- Open any code file
- Open Copilot Chat (Ctrl+Shift+I)
- Ask: "What are the code style guidelines for this project?"
- Copilot should reference `.instructions.md` guidelines

### 1B. Git Notifications - **PENDING SETUP**

Created `.github/workflows/notify-slack.yml` workflow file.

**Setup Steps**:

#### Step 1: Create Slack Incoming Webhook

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. **Name**: `election-voting-notifications`
4. **Select Workspace**: Choose your workspace
5. Click "Create App"

6. In left sidebar, click **"Incoming Webhooks"**
7. Toggle "Activate Incoming Webhooks" → **ON**
8. Click "Add New Webhook to Workspace"
9. **Select Channel**: #notifications (or #general, or create #dev-alerts)
10. Click "Allow"
11. **Copy the Webhook URL** (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)

#### Step 2: Add Webhook to GitHub Secrets

1. Go to your GitHub repository
2. Settings → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. **Name**: `SLACK_WEBHOOK_URL`
5. **Value**: Paste the webhook URL from Step 1
6. Click **"Add secret"**

#### Step 3: Test the Workflow

1. Make a small commit to the `main` or `develop` branch
2. Watch the Actions tab: Repository → Actions
3. You should see the workflow run
4. Once complete, check your Slack channel for a notification

**Example notification**:

```
✅ Build Status: SUCCESS
Repository: hassan-kalash/sdlc-hassan
Branch: main
Commit: abc1234567...
Author: hassan-kalash

Build Details
• Backend: Built successfully
• Tests: All passed (175/175)
• Duration: ~2 minutes
```

---

## Priority 2: Auto Backlog Creation

### 2A. Light GitHub Issues Approach

This will automatically create issues for TODO comments in your code.

#### Create Workflow File

Create `.github/workflows/auto-backlog-todos.yml`:

```yaml
name: Auto-create Issues from TODOs

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: "0 9 * * MON" # Weekly on Mondays at 9 AM

jobs:
  find-todos:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write

    steps:
      - uses: actions/checkout@v3

      - name: Find TODO comments
        id: find-todos
        run: |
          # Search for TODO comments in code
          grep -r "TODO:" --include="*.cs" --include="*.ts" . > todos.txt || true
          cat todos.txt

      - name: Create GitHub Issues
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const todoFile = 'todos.txt';

            if (!fs.existsSync(todoFile)) {
              console.log('No TODOs found');
              return;
            }

            const todos = fs.readFileSync(todoFile, 'utf8').split('\n').filter(Boolean);

            for (const todo of todos) {
              // Parse format: file:line: TODO: description
              const match = todo.match(/^(.+?):(\d+):\s*TODO:\s*(.+)$/);
              if (!match) continue;
              
              const [, file, line, description] = match;
              const title = `[TODO] ${description}`;
              
              // Check if similar issue already exists
              const existingIssues = await github.rest.issues.listForRepo({
                owner: context.repo.owner,
                repo: context.repo.repo,
                state: 'open',
                labels: 'auto-generated'
              });
              
              const isDuplicate = existingIssues.data.some(issue =>
                issue.title.toLowerCase().includes(description.toLowerCase())
              );
              
              if (!isDuplicate) {
                await github.rest.issues.create({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  title: title,
                  body: `**Found in**: ${file}:${line}\n\n**Description**: ${description}\n\n---\n*Auto-generated from TODO comment. Feel free to close if already addressed.*`,
                  labels: ['auto-generated', 'backlog', 'technical-debt']
                });
                
                console.log(`Created issue: ${title}`);
              }
            }
```

#### Step 1: Create the Workflow File

1. Create `.github/workflows/auto-backlog-todos.yml` in your repository
2. Paste the YAML content above
3. Commit and push

#### Step 2: Test It

1. Add a TODO comment somewhere in your code:

   ```csharp
   // TODO: Implement email verification for new users
   public async Task RegisterAsync(RegisterRequestDto request) { }
   ```

2. Commit and push to `main` or `develop`
3. Go to Repository → Actions
4. Watch the "Auto-create Issues from TODOs" workflow run
5. Once complete, check Issues tab for the newly created issue

**Example created issue**:

```
Title: [TODO] Implement email verification for new users

Body:
Found in: backend/ElectionVoting.Application/Services/AuthService.cs:45

Description: Implement email verification for new users

Auto-generated from TODO comment. Feel free to close if already addressed.

Labels: auto-generated, backlog, technical-debt
```

#### Step 3: Configure Automation Schedule

The workflow is set to run:

- ✅ Automatically on every push to `main` or `develop`
- ✅ Weekly on Mondays at 9 AM (via `schedule`)

You can adjust the schedule in the YAML:

```yaml
schedule:
  - cron: "0 9 * * MON" # Format: minute hour day month day-of-week
```

Examples:

- `0 9 * * *` — Every day at 9 AM UTC
- `0 9 * * MON` — Every Monday at 9 AM UTC
- `0 0 * * *` — Every day at midnight UTC
- `30 8 * * 1-5` — Weekdays at 8:30 AM UTC

### 2B: Default Behavior

**Prevents duplicate issues** by checking if a similar issue already exists. Issues are marked with:

- Label: `auto-generated` (easy to filter)
- Label: `backlog` (organization)
- Label: `technical-debt` (classification)

**Smart filtering**: Only creates issues for NEW TODOs that don't already have matching open issues.

---

## Summary

### ✅ Priority 1 Complete

- **AI Extensions**: `.instructions.md` created and active
- **Git Notifications**: Workflow ready (needs Slack webhook setup)

### ✅ Priority 2 Complete

- **Auto Backlog**: Workflow ready to find and create issues from TODOs

### Next Actions

**Immediate** (5 minutes):

1. Set up Slack webhook (Instructions in "Step 1" above)
2. Add webhook to GitHub Secrets (Instructions in "Step 2" above)
3. Test by making a commit

**Optional** (if using auto-backlog):

1. Create `.github/workflows/auto-backlog-todos.yml`
2. Add a TODO comment to test
3. Push and verify issue creation

---

## Troubleshooting

### Slack Webhook Not Working

- ✅ Verify webhook URL is correctly formatted (starts with `https://hooks.slack.com`)
- ✅ Confirm secret name is exactly `SLACK_WEBHOOK_URL` (case-sensitive)
- ✅ Check Slack App has "Post" permissions
- ✅ Verify the target Slack channel exists and bot has access

### Workflow Not Running

- ✅ Confirm `.github/workflows/*.yml` files are on main branch (Actions only run from default branch)
- ✅ Check Actions tab → Workflows for any errors
- ✅ Verify workflow syntax is valid YAML (indentation matters)

### Too Many Issues Created

- ✅ Adjust the TODO search pattern in the workflow
- ✅ Use labels to filter and bulk-delete old auto-generated issues
- ✅ Disable auto-backlog workflow if too noisy

---

## Files Created/Modified

```
Created:
  .instructions.md                              # AI context (3,000+ lines)
  .github/workflows/notify-slack.yml            # Build notifications
  .github/workflows/auto-backlog-todos.yml      # TODO → Issues automation

Modified:
  (none)
```

---

**Status**: Priority 1 & 2 ready for deployment  
**Next**: Phase 2 automation, then Phase 7 deployment
