# Claude Code Configuration for Carlsbad Chamber MCP

This directory contains custom configuration for Claude Code to enhance your workflow with hooks, commands, and specialized agents.

## 📂 Directory Structure

```
.claude/
├── README.md (this file)
├── settings.local.json (permissions and configurations)
├── hooks/
│   ├── user-prompt-submit.sh
│   └── tool-call.sh
└── commands/
    ├── deploy.md
    ├── test.md
    ├── migrate.md
    └── status.md
```

## 🪝 Hooks

Hooks are shell scripts that run automatically at specific events. They enable powerful automation workflows.

### Available Hooks

#### `user-prompt-submit.sh`
Runs when you submit a prompt to Claude.

**Use cases:**
- Provide contextual tips based on keywords
- Log user interactions
- Trigger pre-processing actions

**Example:**
When you type "deploy", it reminds you about the `/deploy` command.

#### `tool-call.sh`
Runs before Claude executes any tool (Read, Write, Bash, etc.).

**Use cases:**
- Request approval for destructive operations
- Log tool usage
- Validate operations before execution
- Create approval requests for sensitive changes

**Features:**
- Detects destructive Bash commands (rm -rf, DROP, DELETE)
- Monitors critical file changes (package.json, .env, etc.)
- Automatically creates approval requests via API
- Posts to http://localhost:3000/api/approvals

**Example Flow:**
1. Claude wants to run `rm -rf node_modules`
2. Hook detects "rm -rf" pattern
3. Creates approval request: "Destructive Bash Command"
4. You get notification on iPhone
5. You approve/reject from mobile

## 📱 Slash Commands

Slash commands are custom workflows you can trigger with `/command-name`.

### Available Commands

#### `/deploy`
Deploy the Carlsbad Chamber application to Vercel.

**Steps:**
1. Build frontend
2. Test locally
3. Deploy to Vercel production
4. Verify deployment
5. Test approval page on mobile

**Usage:** Just type `/deploy`

#### `/test`
Run comprehensive tests on the application.

**Tests:**
- MCP Server connectivity
- API route health checks
- Frontend build validation
- Approval system verification
- TypeScript compilation

**Usage:** `/test`

#### `/migrate`
Migrate data from Atlas MemberClicks to Supabase.

**Process:**
1. Setup Supabase
2. Design schema
3. Extract data from Atlas
4. Transform and clean data
5. Load into Supabase
6. Verify integrity
7. Create backup

**Important:** This requires approval at each step.

**Usage:** `/migrate`

#### `/status`
Show comprehensive project status dashboard.

**Shows:**
- Git status and branch info
- Build health
- Server status
- API connectivity
- Pending approvals count
- Recent commits
- Environment variables

**Usage:** `/status`

## 🤖 Specialized Sub-Agents

Claude Code supports launching specialized agents for complex tasks. Here's how to use them in this project:

### General-Purpose Agent
Best for: Multi-step tasks, complex searches

**Example usage:**
```
"Launch a general-purpose agent to find all instances of Atlas API calls and create a migration plan"
```

### Explore Agent
Best for: Codebase exploration, understanding architecture

**Thoroughness levels:**
- "quick" - Basic search
- "medium" - Moderate exploration
- "very thorough" - Comprehensive analysis

**Example usage:**
```
"Launch an Explore agent with 'very thorough' level to document all API endpoints"
```

### Plan Agent
Best for: Planning large features, architecture decisions

**Example usage:**
```
"Launch a Plan agent to design the multi-tenant database schema for CatalystRise"
```

## 📲 iPhone Approval Workflow

### How It Works

1. **Claude creates approval request**
   - Via API: POST /api/approvals
   - Or via hook: tool-call.sh detects sensitive operation

2. **You get notified**
   - Visit https://your-app.vercel.app/approve on iPhone
   - See pending approvals in real-time
   - Auto-refreshes every 5 seconds

3. **You approve/reject**
   - One-tap approve (green button)
   - One-tap reject (red button)
   - Optional: Add notes

4. **Claude proceeds**
   - Hook checks approval status
   - If approved: Execute operation
   - If rejected: Skip and notify

### Mobile PWA Installation

1. Open Safari on iPhone
2. Navigate to https://your-app.vercel.app/approve
3. Tap Share button
4. Scroll and tap "Add to Home Screen"
5. Tap "Add"

Now you have a native-like app on your iPhone!

## 🔐 Security & Permissions

### Configured Permissions (settings.local.json)

**Auto-allowed:**
- `npm install`
- `npm run build`
- `git add`, `git commit`, `git push`, `git pull`
- `vercel login`, `vercel --prod`

**Requires approval:**
- File deletions
- Database operations
- Critical file modifications

## 🎯 Best Practices

### For Hooks
1. Keep hooks fast (<1 second execution)
2. Always exit with 0 to allow operations to proceed
3. Use hooks for logging and notifications, not blocking
4. Test hooks locally before relying on them

### For Slash Commands
1. Make commands idempotent (safe to run multiple times)
2. Include clear steps and success criteria
3. Create approval requests for risky operations
4. Provide detailed output for debugging

### For Sub-Agents
1. Launch agents for complex, multi-file tasks
2. Use "quick" thoroughness for simple searches
3. Use "very thorough" for critical tasks
4. Review agent output before accepting changes

## 🚀 Advanced Workflows

### Example: Automated Deployment with Approval

```bash
# 1. User types: /deploy
# 2. Claude reads deploy.md command
# 3. Claude builds frontend
# 4. Hook detects "vercel --prod" command
# 5. Hook creates approval request
# 6. User approves on iPhone
# 7. Claude deploys to Vercel
# 8. Claude creates final approval with deployment URL
# 9. User clicks URL on iPhone to verify
```

### Example: Data Migration with Checkpoints

```bash
# 1. User types: /migrate
# 2. Claude launches Plan agent to design schema
# 3. Claude creates approval: "Schema Design"
# 4. User reviews schema on iPhone and approves
# 5. Claude extracts data from Atlas
# 6. Claude creates approval: "Data Preview (100 records)"
# 7. User verifies sample data and approves
# 8. Claude loads full dataset
# 9. Claude creates approval: "Migration Complete - Verify"
# 10. User tests new database on iPhone
```

## 🐛 Troubleshooting

### Hooks not running?
- Check permissions: `ls -la .claude/hooks/`
- Make executable: `chmod +x .claude/hooks/*.sh`
- Test manually: `./.claude/hooks/tool-call.sh Bash "test command"`

### Approvals not appearing?
- Ensure frontend dev server is running: `cd atlas-frontend && npm run dev`
- Check API endpoint: `curl http://localhost:3000/api/approvals`
- Verify hook has correct URL in tool-call.sh

### Commands not found?
- Commands must be in `.claude/commands/` directory
- Commands must have `.md` extension
- Test with `/help` to see available commands

## 📚 Further Reading

- [Claude Code Docs - Hooks](https://docs.claude.com/en/docs/claude-code/hooks)
- [Claude Code Docs - Commands](https://docs.claude.com/en/docs/claude-code/commands)
- [Claude Code Docs - Agents](https://docs.claude.com/en/docs/claude-code/agents)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 🎉 What's Next?

1. **Test the approval workflow**
   - Create a test approval: `curl -X POST http://localhost:3000/api/approvals -H "Content-Type: application/json" -d '{"title":"Test","description":"Testing approvals","category":"other"}'`
   - Visit http://localhost:3000/approve on your iPhone
   - Approve it!

2. **Try a slash command**
   - Type `/status` to see project health
   - Type `/test` to run tests

3. **Deploy to Vercel**
   - Type `/deploy`
   - Approve deployment on iPhone
   - Test live approval page

4. **Create custom commands**
   - Add new `.md` files to `.claude/commands/`
   - Describe your workflow
   - Claude will follow it when you run the command

Enjoy your supercharged Claude Code workflow! 🚀
