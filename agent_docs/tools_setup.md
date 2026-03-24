# Tools Setup
# Read this when: installing tools, starting a new project, or using any tool for the first time.

---

## Context7 MCP (Live Library Documentation)
Pulls up-to-date, version-specific docs for any library directly into Claude's context.
Prevents hallucinated APIs and outdated code examples.
Requires: Node.js. Free tier available, API key for higher rate limits.

```bash
# One-line install in Claude Code
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp --api-key YOUR_KEY

# Or remote (faster)
claude mcp add --scope user --header "CONTEXT7_API_KEY: YOUR_KEY" --transport http context7 https://mcp.context7.com/mcp

# Get free API key at: https://context7.com/dashboard
```

Once installed, just add `use context7` to any prompt:
```
Set up Zustand with Next.js App Router. use context7
Implement Zod validation for this form. use context7 /colinhacks/zod
```
To skip the library-matching step, use the library ID directly: `use library /vercel/next.js`

---

## UI UX Pro Max (Design Intelligence)
Generates complete design systems — styles, colors, typography, anti-patterns.
Requires: Node.js + Python 3.x. No API key.

```bash
npm install -g uipro-cli
uipro init --ai claude
# Generates: .claude/skills/ui-ux-pro-max/

# Generate + persist design system for this project (run once per project)
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "[product type]" \
  --design-system --persist -p "[Project Name]"
# Output: design-system/MASTER.md + design-system/pages/
```

When building a page, tell Claude:
> "Read design-system/MASTER.md. Check design-system/pages/[page].md if it exists. Then build."

---

## Nano Banana 2 (Image Generation)
Google's Gemini 3.1 Flash Image model. Fast, 4K output, subject consistency.
Requires: `GEMINI_API_KEY` in `.env`  →  https://aistudio.google.com

```javascript
// Model: "gemini-3.1-flash-image-preview"
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "PROMPT HERE" }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
    })
  }
);
```

Aspect ratio defaults: heroes → 16:9 | avatars → 1:1 | mobile social → 9:16
Resolution: minimum 1024px, prefer 2048px for landing pages.

---

## Google Stitch MCP (Design-to-Code Bridge)
Connects Stitch AI designs directly to Claude Code. Claude reads design HTML/CSS/tokens.
Requires: Google Cloud project with Stitch API enabled. Free to use.

```bash
# One-time setup (Google Cloud already authorized)
gcloud config set project YOUR_PROJECT_ID
gcloud beta services mcp enable stitch.googleapis.com --project=YOUR_PROJECT_ID
npx @_davideast/stitch-mcp init    # auto-writes MCP config to ~/.claude/mcp.json
```

```bash
# Workflow
npx @_davideast/stitch-mcp view --projects
npx @_davideast/stitch-mcp serve -p <project-id>   # local Vite preview
```

---

## Claude SEO Skill
Full technical audits, schema generation, Core Web Vitals, AI search optimization.
Requires: Python 3.8+. No API key for core features.

```bash
curl -fsSL https://raw.githubusercontent.com/AgriciDaniel/claude-seo/main/install.sh | bash
```

Commands (run inside `claude` CLI):
```
/seo audit https://[domain]        # full parallel audit
/seo technical https://[domain]    # Core Web Vitals + technical
/seo schema https://[domain]       # detect + validate + generate schema
/seo geo https://[domain]          # AI Overviews / GEO optimization
/seo plan [saas|local|ecommerce]   # strategic SEO plan
```

---

## claude-mem (Persistent Session Memory)
Auto-captures everything Claude does during sessions, compresses with AI, and injects
relevant context back into future sessions. Solves the "Claude forgets between sessions" problem.
Requires: Node.js 18+, Claude Code plugin system. No API key.

Note: This is *session memory* (what Claude did), not the same as CLAUDE.md (project rules).
They work together — CLAUDE.md sets the rules, claude-mem remembers the work.

```bash
# Install via Claude Code (two commands, then restart)
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
# Restart Claude Code — memory is now automatic, no further config needed
```

After install, Claude automatically:
- Captures tool usage and decisions during every session
- Compresses and stores them in a local SQLite + vector database
- Injects relevant past context at the start of new sessions

Web viewer for browsing memory: http://localhost:37777

Privacy tip: wrap sensitive content in `<private>` tags to exclude from storage.

Search your project memory mid-session:
```
# Natural language search via the mem-search skill
"What did we decide about the auth flow last week?"
"Show me all the times we fixed a layout bug"
```

---

## Anthropic Code Review Plugin (Official)
Anthropic's official code review skill. Reviews logic, security, and quality —
not just formatting (Biome handles that). These are complementary, not redundant.
Requires: Claude Code plugin system. No API key.

```bash
# Install via Claude Code marketplace
/plugin marketplace add anthropics/claude-code
/plugin install code-review@anthropics-claude-code
```

Usage — run a review on staged changes or a specific file:
```
/review                          # review current git diff / staged changes
/review src/components/Auth.tsx  # review a specific file
```

---

## Anthropic Official Skills
```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

---

## 21st.dev Components
Community UI components, copy-paste ready. No account needed to browse.
→ https://21st.dev/community/components

---

## Required .env Keys
```bash
GEMINI_API_KEY=          # Nano Banana 2 — https://aistudio.google.com
GOOGLE_CLOUD_PROJECT=    # Stitch MCP — GCP Project ID (auth via gcloud, no key)
CONTEXT7_API_KEY=        # Context7 — https://context7.com/dashboard (free tier)
# Optional for live SEO data:
# AHREFS_API_KEY=
# SEMRUSH_API_KEY=
```
