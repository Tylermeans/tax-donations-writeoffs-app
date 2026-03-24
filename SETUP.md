# SETUP.md — New Project Quickstart
# For humans. Claude doesn't need to read this.
# Run through this once when starting a new project.

---

## Step 1 — Fill in Project Config
Open `CLAUDE.md` and update the Project block at the top:
```
Name    : Your App Name
Type    : SaaS / Landing Page / Dashboard / etc.
Stack   : Next.js / React / Vue / etc.
Domain  : yourapp.com
```

---

## Step 2 — One-Time Machine Setup
Only do this once per machine, not per project.

**Context7 MCP (live library docs)**
```bash
# Get free API key first: https://context7.com/dashboard
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp --api-key YOUR_KEY
```

**UI UX Pro Max (design intelligence)**
```bash
npm install -g uipro-cli
# Requires Python 3.x — check: python3 --version
# Mac: brew install python3  |  Ubuntu: sudo apt install python3
```

**Claude SEO**
```bash
# Mac/Linux
curl -fsSL https://raw.githubusercontent.com/AgriciDaniel/claude-seo/main/install.sh | bash
# Windows
irm https://raw.githubusercontent.com/AgriciDaniel/claude-seo/main/install.ps1 | iex
```

**Google Stitch MCP**
```bash
# Install gcloud CLI if needed: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
gcloud beta services mcp enable stitch.googleapis.com --project=YOUR_GCP_PROJECT_ID
npx @_davideast/stitch-mcp init
```

**Ralph (autonomous dev loop) — Optional**
```bash
# Only install if you want unattended/autonomous builds
git clone https://github.com/frankbria/ralph-claude-code.git
cd ralph-claude-code && ./install.sh
# macOS also needs: brew install tmux jq coreutils
```

---

## Step 3 — API Keys
```bash
cp .env.example .env
# Fill in your .env:
```
```
GEMINI_API_KEY=       # → https://aistudio.google.com (free tier)
GOOGLE_CLOUD_PROJECT= # your GCP project ID
CONTEXT7_API_KEY=     # → https://context7.com/dashboard (free tier)
```
**Never paste keys into chat.** Revoke immediately if you do:
→ https://console.cloud.google.com/apis/credentials

---

## Step 4 — Per-Project Setup (run at project start)
```bash
# 1. Install UI UX Pro Max into this project
uipro init --ai claude

# 2. Generate your design system (takes ~10s)
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "[your product type]" \
  --design-system --persist -p "[Your App Name]"
# → Creates design-system/MASTER.md — source of truth for all UI work

# 3. Install Claude Code plugins (run inside `claude` CLI)
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
/plugin marketplace add anthropics/claude-code
/plugin install code-review@anthropics-claude-code

# 5. Install Claude Code Channels (Telegram/Discord remote control)
/plugin marketplace add anthropics/claude-plugins-official
/plugin install telegram@claude-plugins-official
# Then: brew install bun (if on mac) or https://bun.sh

# 6. Restart Claude Code after installing plugins
```

---

## Step 5 — Start Building
```bash
claude
# Claude reads CLAUDE.md automatically. Memory from past sessions loads via claude-mem.
# Add "use context7" to any prompt for live library docs.
```

---

## Step 6 — Before Launch
```bash
# Inside the claude CLI:
/seo audit https://yourdomain.com
/seo technical https://yourdomain.com
/review   # final code review pass
```

---

## Optional: Autonomous Mode with Ralph
If you want Claude to build a whole feature/project unattended:
```bash
# In your project root:
ralph-enable              # interactive setup wizard
# Edit .ralph/PROMPT.md and .ralph/fix_plan.md
ralph --monitor           # start the autonomous loop
```
See `agent_docs/ralph_workflow.md` for full details.

---

## Quick Reference — Key URLs
| Tool | URL |
|------|-----|
| Gemini API keys | https://aistudio.google.com |
| Context7 API keys | https://context7.com/dashboard |
| Google Cloud Console | https://console.cloud.google.com |
| 21st.dev components | https://21st.dev/community/components |
| UI UX Pro Max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| Claude SEO | https://github.com/AgriciDaniel/claude-seo |
| Stitch MCP | https://github.com/davideast/stitch-mcp |
| Anthropic Skills | https://github.com/anthropics/skills |
| Context7 | https://github.com/upstash/context7 |
| claude-mem | https://github.com/thedotmack/claude-mem |
| Ralph | https://github.com/frankbria/ralph-claude-code |
| Claude Code Channels | https://code.claude.com/docs/en/channels |
| Cowork Dispatch | https://support.claude.com/en/articles/13947068-assign-tasks-to-claude-from-anywhere-in-cowork |
| bassimeledath/dispatch | https://github.com/bassimeledath/dispatch |
