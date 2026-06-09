# Braze Copilot — Hackathon Skeleton

An opinionated AI practitioner for the Braze platform. Built for the Braze Partner Hackathon, June 9-10 2025.

---

## What this is

A working skeleton web application that:
- Loads three knowledge MD files (best practice, client context, ecosystem architecture)
- Reads live Braze workspace data (campaigns, canvases, segments, custom attributes)
- Passes everything to Claude as context for every conversation
- Can build and POST a Canvas directly to Braze via the dashboard API

The skeleton proves the architecture works end to end. The team's job on hackathon days is to make it brilliant.

---

## Prerequisites

- Node.js 18+
- A Braze API key (REST, read permissions)
- An Anthropic API key
- A Braze dashboard session (for Canvas write — grabbed via DevTools on demo day)

---

## Setup

### 1. Clone / copy this folder to your machine

### 2. Set environment variables

Create a `.env` file or export before running:

```bash
export BRAZE_API_KEY="your_braze_api_key"
export BRAZE_REST_ENDPOINT="rest.iad-01.braze.com"          # change to your cluster
export BRAZE_DASHBOARD_ENDPOINT="dashboard-01.braze.eu"     # change to your cluster
export ANTHROPIC_API_KEY="your_anthropic_api_key"
```

### 3. Start the proxy server

```bash
node server/proxy.js
```

You should see the startup banner with the checklist.

### 4. Open the app

Navigate to: http://localhost:3000

---

## Demo day — grab session credentials (5 mins)

For Canvas write to work, you need a valid Braze session:

1. Open Braze dashboard in Chrome
2. Open DevTools → Network tab
3. Click anything in the Braze UI (e.g. navigate to Campaigns)
4. Click any network request in the list
5. In Request Headers, find:
   - `Cookie` → copy the value after `_session_id=` (up to the next `;`)
   - `X-CSRF-Token` → copy the full value
6. In the Copilot app, click ⚙ Config and paste both values
7. Or set as env vars: `BRAZE_SESSION_ID` and `BRAZE_CSRF_TOKEN`

**Do this on the morning of the demo — sessions expire.**

---

## Knowledge files — team homework before June 9th

The copilot is only as good as its knowledge. Fill these in before the hackathon:

| File | Owner | What to fill in |
|------|-------|-----------------|
| `knowledge/best-practice.md` | Platform specialists | All `[FILL IN]` sections with real delivery knowledge |
| `knowledge/client-context.md` | Platform specialists | Hackathon demo client context (use a fictional client) |
| `knowledge/ecosystem-architecture.md` | Technical architects | What channels, integrations, and APIs are available in the demo |

The more complete these files are, the more impressive the copilot's answers will be.

---

## Project structure

```
braze-copilot/
├── public/
│   └── index.html          ← Frontend web app (single file)
├── server/
│   └── proxy.js            ← Local proxy server (Node, no dependencies)
├── knowledge/
│   ├── best-practice.md    ← Braze delivery best practice playbook
│   ├── client-context.md   ← Client-specific context and data model
│   └── ecosystem-architecture.md  ← What's connected, what's possible
├── package.json
└── README.md
```

---

## What to build on hackathon days

### Day 1 priorities (EMEA lead, hand off to NA)
- [ ] Complete all three knowledge MD files
- [ ] Validate live API reads are working correctly
- [ ] Test the copilot's reasoning quality — iterate on the system prompt
- [ ] Improve the UI: better markdown rendering, Canvas config display, message formatting
- [ ] Add more Braze API reads: content blocks, templates, scheduled broadcasts

### Day 2 priorities
- [ ] Implement full 7-phase Canvas payload assembly
- [ ] Test Canvas write end to end in the hackathon sandbox
- [ ] Build the demo script and seed the sandbox with appropriate data
- [ ] Record the demo video
- [ ] Polish the UI for presentation quality

---

## Architecture overview

```
Browser (index.html)
    ↓ fetch
Local proxy (server/proxy.js)
    ↓ reads knowledge MD files
    ↓ calls Braze REST API (read)
    ↓ calls Claude API (reasoning)
    ↓ POSTs to Braze dashboard (Canvas write)
```

No external dependencies. No build step. Runs anywhere Node is installed.

---

## The demo script (draft — refine on Day 2)

1. **Open the copilot** — workspace loads, show campaign/canvas counts
2. **Morning brief** — "Give me a morning brief on the workspace"
   - Copilot audits live data and flags issues unprompted
3. **Audit** — "What are the top 3 things I should fix today?"
   - Copilot gives opinionated, specific, best-practice-grounded answers
4. **Build** — "Build me a win-back Canvas for lapsed customers"
   - Copilot asks one clarifying question, then designs and builds
   - Click "Build this Canvas in Braze"
   - Switch to Braze dashboard — Canvas is there
5. **The line** — "This is what a senior Braze practitioner looks like at scale."

---

Built for the Braze Partner Hackathon · June 2025
