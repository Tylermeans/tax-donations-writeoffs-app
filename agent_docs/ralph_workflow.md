# Ralph Autonomous Loop
# Read this when: you want Claude Code to run autonomously on a whole feature or project.
# This is OPTIONAL and advanced — not needed for normal session-by-session work.

---

## What Ralph Does
Ralph runs Claude Code in a continuous autonomous loop until a project or feature is complete.
You give it a PRD or task list, it keeps looping — writing code, testing, fixing — until done.
Built-in safeguards: rate limiting, circuit breaker, exit detection, session continuity.

Best for: building a whole feature unattended, importing a PRD and letting it run overnight.
Not needed for: normal interactive Claude Code sessions (just use `claude` as usual).

---

## Install (One Time Per Machine)
```bash
git clone https://github.com/frankbria/ralph-claude-code.git
cd ralph-claude-code
./install.sh
# Adds global commands: ralph, ralph-enable, ralph-monitor, ralph-import, ralph-setup
# After install, you can delete the cloned repo if you want
```

Requires: Claude Code CLI, tmux, jq, Bash 4.0+
```bash
# macOS dependencies
brew install tmux jq coreutils   # coreutils gives you gtimeout
```

---

## Enable Ralph In This Project
```bash
cd your-project

# Option A: Interactive wizard (detects project type, imports tasks)
ralph-enable

# Option B: Import from a PRD/requirements doc
ralph-import your-requirements.md
```

This creates a `.ralph/` folder:
```
.ralph/
├── PROMPT.md      # ← Edit this: your project goals and principles
├── fix_plan.md    # ← Edit this: specific tasks (checkboxes)
├── AGENT.md       # Auto-maintained: build/test commands
└── specs/         # Optional: detailed requirements per feature
```

---

## Run
```bash
ralph --monitor          # recommended: integrated tmux dashboard
ralph --live             # real-time output streaming
ralph --timeout 30       # 30 min max per loop (default: 15)
```

Ralph stops when:
- All tasks in `fix_plan.md` are checked off
- Claude explicitly signals `EXIT_SIGNAL: true`
- Rate limit hit (100 calls/hour by default)
- Circuit breaker opens (stuck loop detection)

---

## Configuration (.ralphrc)
```bash
# .ralphrc — auto-created by ralph-enable
MAX_CALLS_PER_HOUR=100
CLAUDE_TIMEOUT_MINUTES=15
ALLOWED_TOOLS="Write,Read,Edit,Bash(git *),Bash(npm *)"
SESSION_CONTINUITY=true
SESSION_EXPIRY_HOURS=24
```

---

## Key Commands
```bash
ralph --status            # check current loop status
ralph --reset-session     # reset session context
ralph --circuit-status    # check circuit breaker
ralph-monitor             # live dashboard (separate terminal)
```

---

## Advanced: Ruflo Multi-Agent Swarms (Optional)
Ruflo (formerly Claude Flow) is the next level up from Ralph. Instead of one autonomous agent
looping on a task, you spawn a coordinated swarm of specialized agents working in parallel.

**When to use Ruflo instead of Ralph:**
- Building multiple parallel tracks simultaneously (frontend + backend + auth + tests)
- Large features where specialist agents (architect, coder, tester, security scanner) working
  concurrently would meaningfully cut time
- You want agents that learn from past sessions and route work intelligently

**When to stick with Ralph:**
- Solo app building, single-track features
- You want simple and reliable over powerful and complex
- You don't have time to debug alpha software

> ⚠️ Stability note: Ruflo v3.5 is alpha with 370+ open issues as of March 2026.
> Expect rough edges. Ralph is more stable for day-to-day solo work.

### Install
```bash
npx ruflo@latest init --wizard
# or equivalently:
npx claude-flow@latest init --wizard
```

### Add MCP Servers to Claude Code
```bash
claude mcp add claude-flow npx claude-flow@v3alpha mcp start
claude mcp add ruv-swarm npx ruv-swarm mcp start
```

### Key Commands
```bash
# Start the always-on background daemon
npx claude-flow@v3alpha daemon start

# Spawn a hive mind swarm on an objective
npx ruflo hive-mind spawn "Build the auth system with JWT + refresh tokens"

# With specific topology and consensus
npx ruflo hive-mind spawn "..." --queen-type strategic --consensus byzantine

# Monitor
npx ruflo hive-mind status
npx ruflo hive-mind metrics

# Health check
npx claude-flow@v3alpha doctor --fix
```

### Swarm Topologies
```
hierarchical  → queen directs workers (best for coding tasks)
mesh          → peer-to-peer agents (best for research/analysis)
adaptive      → auto-selects based on task
```

### Specialist Agent Types
`researcher` · `coder` · `analyst` · `tester` · `architect` · `reviewer` · `optimizer` · `documenter`
Plus 50+ more across security, DevOps, mobile, ML, and GitHub workflow categories.

### Example: Spawn a Full Feature Build
```bash
npx ruflo hive-mind spawn "Build a complete user authentication system:
  - JWT access tokens + refresh token rotation
  - Email/password + OAuth (Google)
  - Protected route middleware
  - Full test coverage
  Stack: Next.js 15, Prisma, PostgreSQL"
```
Ruflo spawns architect → backend-dev → tester → reviewer in parallel,
shares memory between them, and consolidates into production-ready code.

→ https://github.com/ruvnet/ruflo
