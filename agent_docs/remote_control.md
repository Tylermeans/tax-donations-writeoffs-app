# Remote Control & Dispatch
# Read this when: setting up phone-to-desktop control, background worker agents,
# or an always-on Claude Code session you can reach from anywhere.

---

## The Three Layers (pick what fits your workflow)

| Tool | What it does | Best for |
|------|-------------|----------|
| **Cowork Dispatch** | Control your desktop Cowork session from your phone | File tasks, email, Notion, docs — non-code work |
| **Claude Code Channels** | Send messages to a running Claude Code session via Telegram/Discord | Remote coding control, build status, quick prompts |
| **bassimeledath/dispatch** | Fan coding tasks out to parallel background workers inside Claude Code | Context window management, parallel multi-task builds |

They don't overlap. You can run all three simultaneously.

---

## 1. Cowork Dispatch (Official Anthropic — March 2026)
Your phone becomes a remote control for your desktop Claude session.
All processing happens locally on your machine — files never leave your computer.
Requires: Claude Pro ($20/mo) or Max ($100/mo). Claude Desktop + Claude mobile app.

### Setup (2 minutes)
```
1. Update Claude Desktop to latest version
2. Open Claude Desktop → click "Cowork" in sidebar
3. Click "Dispatch" → click "Get started"
4. Toggle on file access + keep-awake
5. Scan the QR code with the Claude app on your phone
```
That's it. No API keys, no config files, no OAuth. Scan and go.

### What You Can Do From Your Phone
```
"Find all contracts in my Documents folder and summarize the deadlines"
"Summarize yesterday's Notion meeting notes"
"Check my calendar tomorrow and prep a briefing for each meeting"
"Search my emails from this morning for anything urgent"
"Organize the files in my Downloads folder by type"
```

### Key Limits
- Your computer must stay awake and Claude Desktop must be open
- Works with 38+ connectors: Gmail, Google Drive, Notion, Slack, Microsoft 365
- Designed for document/productivity work, not terminal coding
- Currently research preview — rolling out to Pro after Max

---

## 2. Claude Code Channels (Official Anthropic — March 2026)
Adds a Telegram or Discord bot to your running Claude Code session.
Send a message from your phone → Claude does the work on your machine → texts you back.
Requires: Claude.ai login (not API key), Claude Code v2.1.80+, Bun installed.

### Prerequisites
```bash
# Check versions
claude --version    # needs v2.1.80+
bun --version       # install at https://bun.sh if missing

# Add the official plugin marketplace (run once)
/plugin marketplace add anthropics/claude-plugins-official
```

### Telegram Setup
```
1. Open Telegram → search @BotFather → send /newbot
2. Give it a name and username (must end in "bot")
3. Copy the token BotFather returns
```

```bash
# In Claude Code, install the Telegram plugin
/plugin install telegram@claude-plugins-official
/reload-plugins

# Configure with your bot token
/configure-telegram
# Paste your token when prompted — saved to ~/.claude/channels/telegram/.env
```

```bash
# Start Claude Code with the channel active
claude --channels plugin:telegram@claude-plugins-official
```

```
# In Telegram: message your bot → it replies with a pairing code
# Back in Claude Code: /pair-telegram <code>
# Done — send any message to your bot and Claude responds
```

### Discord Setup
```
1. Go to discord.com/developers → New Application → create Bot
2. Copy the bot token
3. Enable "Message Content Intent" under Privileged Gateway Intents
4. OAuth2 → URL Generator → select bot scope → add to your server
```

```bash
/plugin install discord@claude-plugins-official
/reload-plugins
/configure-discord
# Paste token when prompted

claude --channels plugin:discord@claude-plugins-official
# Use /pair-discord in Claude Code to link your server
```

### Always-On Setup with tmux (recommended)
Without tmux, closing your terminal kills the channel. With tmux it stays alive.

```bash
# Create a persistent named session
tmux new -s claude-channels

# Inside the session — auto-restarts if it crashes
while true; do
  claude --channels plugin:telegram@claude-plugins-official
  sleep 5
done

# Detach and leave it running
# Press: Ctrl+B then D

# Reattach anytime to check on it or handle permission prompts
tmux attach -t claude-channels
```

### Always-On on a VPS (truly headless 24/7)
If you don't want to keep your laptop on:
```bash
# On your VPS (1-2GB RAM is enough — processing happens on Anthropic's servers)
# SSH in, then install Claude Code, login, configure channels, then:

sudo nano /etc/systemd/system/claude-channels.service
```
```ini
[Unit]
Description=Claude Code Channels
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/projects
ExecStart=/usr/local/bin/claude --channels plugin:telegram@claude-plugins-official
Restart=on-failure
RestartSec=10
Environment=HOME=/home/your-username

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable claude-channels
sudo systemctl start claude-channels
```

### Key Limits to Know
- **Permission prompts freeze silently** — if Claude needs to approve a risky action, it
  stops and waits at the terminal. You can't unblock it from Telegram. Use tmux `--dangerously-skip-permissions`
  only on trusted projects you fully control.
- **Telegram and Discord only** — no Slack, WhatsApp, iMessage in the official preview
- **Research preview** — protocol and plugin commands may change Q2-Q3 2026
- **Sends images as compressed** — long-press → "Send as File" in Telegram to send uncompressed

### Testing Without Phone (fakechat)
```bash
/plugin install fakechat@claude-plugins-official
claude --channels plugin:fakechat@claude-plugins-official
# Opens a localhost chat UI in your browser — same as Telegram/Discord but local
```

---

## 3. bassimeledath/dispatch (Background Worker Agents)
A Claude Code skill that fans coding tasks out to parallel background workers,
each with their own full context window. Keeps your main session lean.

Without dispatch: tasks pile up in one context window → Claude loses track by task 3-4.
With dispatch: workers run in parallel with fresh contexts → your session stays as the coordinator.

Requires: Claude Code. No API key. Install once globally.

### Install
```bash
# Global install (all projects)
npx skills add bassimeledath/dispatch -g

# Or project-level (team-shared via git)
npx skills add bassimeledath/dispatch
```

### Usage
```bash
# Basic dispatch — workers run in background
/dispatch review the auth module for security issues

# Specify model per task
/dispatch use opus to review this PR for edge cases
/dispatch use gemini to refactor the config parser

# Multiple tasks in one go
/dispatch use sonnet to:
  1. Write tests for the checkout flow
  2. Update the API documentation
  3. Refactor the user model
```

### How It Works
```
Your session → writes checklist → spawns background workers
Workers → each gets fresh full context window → executes task
Workers → surface questions to you when blocked (no silent failure)
Workers → report completions back to your session
Your session → stays lean, coordinates, never gets bloated
```

### When a Worker Gets Stuck
Workers don't silently fail or hallucinate past blockers. They surface a question:
```
Worker is asking: "requirements.txt doesn't exist. What should I implement?"
> Add a /health endpoint returning JSON with uptime and version
Answer sent. Worker continuing.
```

### Mix Models Per Task
```bash
# Claude for deep reasoning, Gemini for speed, whatever fits
/dispatch use opus to architect the new payment system
/dispatch use gemini to generate boilerplate for all the new routes
/dispatch use sonnet to write tests for everything gemini wrote
```

→ https://github.com/bassimeledath/dispatch

---

## Recommended Stack for Always-On Development
```
Phone control of non-code work  →  Cowork Dispatch (QR pair, done)
Remote coding from phone        →  Claude Code Channels + tmux
Parallel task execution         →  bassimeledath/dispatch in your sessions
Autonomous feature builds       →  Ralph (see ralph_workflow.md)
Multi-agent swarms              →  Ruflo (see ralph_workflow.md, advanced section)
```
