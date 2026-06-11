/**
 * Braze Copilot — Local Proxy Server
 * 
 * Runs locally on your machine. Bridges the browser frontend to:
 *   1. Braze REST API (read operations via API key)
 *   2. Braze Dashboard API (write operations via session + CSRF token)
 *   3. Claude API (AI reasoning layer)
 *   4. Local knowledge MD files
 * 
 * Start: node server/proxy.js
 * Runs on: http://localhost:3000
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Fill these in before the hackathon. Refresh session/CSRF on demo day via DevTools.

const CONFIG = {
  // Braze REST API (read operations)
  brazeApiKey: (process.env.BRAZE_API_KEY || '').trim(),
  brazeRestEndpoint: (process.env.BRAZE_REST_ENDPOINT || 'rest.fra-01.braze.eu').replace(/^https?:\/\//, '').trim(),

  // Braze Dashboard (write operations — grab from DevTools Network tab on demo day)
  brazeSessionId: (process.env.BRAZE_SESSION_ID || '').trim(),
  brazeCsrfToken: (process.env.BRAZE_CSRF_TOKEN || '').trim(),
  brazeRememberToken: (process.env.BRAZE_REMEMBER_TOKEN || '').trim(),
  brazeDashboardEndpoint: (process.env.BRAZE_DASHBOARD_ENDPOINT || 'dashboard-01.braze.eu').replace(/^https?:\/\//, '').trim(),

  // Claude API
  anthropicApiKey: (process.env.ANTHROPIC_API_KEY || '').trim(),

  // Server
  port: process.env.PORT || 3000,
  knowledgeDir: path.join(__dirname, '../knowledge')
};

// Used for Dashboard API calls (custom attribute usage scan)
const ATTRIBUTES_APP_GROUP_ID = '6a003bbcb79981004762f2b4';

// ─── KNOWLEDGE LOADER ─────────────────────────────────────────────────────────

// ─── INTENT CLASSIFIER ────────────────────────────────────────────────────────

function classifyIntent(messages) {
  const lastMessage = messages?.slice?.()?.reverse?.()?.find?.(m => m.role === 'user');
  const text = (typeof lastMessage?.content === 'string'
    ? lastMessage.content
    : lastMessage?.content?.map?.(c => c.text || '').join(' ') || ''
  ).toLowerCase();

  if (/hypercare/.test(text)) {
    return 'hypercare_brief';
  }
  if (/unsubscribe|anomal|spike|duplicate profile|429|5xx/.test(text)) {
    return 'workspace_health';
  }
  if (/audit|health|review|check|violation|best practice|flag|issue|problem|fix|wrong|broken|stale|duplicate/.test(text)) {
    return 'audit';
  }
  if (/brief|build|canvas|create|journey|campaign|push|email|sms|message|step|delay|action path|audience path|segment|schedule|launch|deploy/.test(text)) {
    return 'canvas_build';
  }
  if (/metric|performance|open rate|click|conversion|revenue|report|analytics|results|stats|how did|how is/.test(text)) {
    return 'metrics';
  }
  if (/morning|brief|summary|today|overnight|what happened|update|status/.test(text)) {
    return 'hypercare_brief';
  }
  if (/liquid|personalise|personalize|variable|default|attribute|template|code|syntax/.test(text)) {
    return 'liquid';
  }
  if (/unused|orphan|cleanup|housekeeping|migration|legacy|archive|delete|redundant/.test(text)) {
    return 'housekeeping';
  }

  return 'general';
}

// ─── KNOWLEDGE LOADER ─────────────────────────────────────────────────────────

const KNOWLEDGE_MAP = {
  canvas_build: ['best-practice.md', 'client-context.md', 'braze-api-reference.md', 'canvas-brief.md'],
  audit:        ['migration-audit-module.md'],
  workspace_health: ['workspace-health-module.md'],
  metrics:      ['canvas-metrics-module.md', 'best-practice.md', 'client-context.md'],
  hypercare_brief:['braze_hypercare_morning_brief.md'],
  liquid:       ['client-context.md', 'braze-api-reference.md', 'best-practice.md'],
  housekeeping: ['housekeeping-module.md'],
  general:      ['best-practice.md', 'client-context.md', 'ecosystem-architecture.md']
};

function loadKnowledge(intent = 'general') {
  const files = KNOWLEDGE_MAP[intent] || KNOWLEDGE_MAP.general;
  return files.map(f => {
    try {
      const content = fs.readFileSync(path.join(CONFIG.knowledgeDir, f), 'utf8');
      return `\n\n---\n## ${f.replace('.md', '').replace(/-/g, ' ').toUpperCase()}\n\n${content}`;
    } catch (e) {
      return `\n\n---\n## ${f} — NOT FOUND`;
    }
  }).join('');
}

function buildSystemPrompt(brazeContext, intent = 'general') {
  const knowledge = loadKnowledge(intent);
  return `You are the Braze Copilot — an opinionated, expert AI practitioner for the Braze customer engagement platform.

You work as a senior member of a Braze delivery partner team. You are not a neutral assistant — you have strong, well-reasoned opinions about what good looks like on Braze, and you proactively share them. You catch problems before they ship. You recommend better approaches. You build things.

## Your knowledge base
${knowledge}

## Live workspace context
${brazeContext}

## How you behave

OPINIONATED: When you see something that violates best practice, say so clearly and explain why. Don't hedge. Don't say "you might want to consider." Say "this is wrong and here is how to fix it."

CONTEXTUAL: Every recommendation references the client's actual data model. Use real attribute names, real segment names, real event names. Never give generic advice when you have specific context.

PROACTIVE: Don't just answer the question asked. If you spot a related issue while answering, flag it. A good practitioner doesn't stay in their lane when they see a problem.

PRECISE: When building a Canvas, produce the complete, valid configuration. No placeholders. No "fill this in later." If you don't have enough information to complete something, ask the one specific question you need answered.

STRUCTURED: When producing Canvas configurations, message copy, or Liquid code, format it clearly and completely so it can be used directly.

## Canvas JSON output format
When producing a Canvas configuration, always structure your response as follows:
1. First explain your reasoning — why this structure, why these segments, why this timing
2. Show a human-readable summary of the Canvas design using this exact format:

**Canvas name** — [name]
**Objective** — [one sentence]
**Audience** — [segment name] ([segment ID]) + [entry filters]
**Schedule** — [type] | [start] → [end]

**Journey flow:** -- example -- 
[Entry: segment + filters]
     ↓
[Step 1 name — type — channel]
     ↓
[Step 2 name — type — duration if delay]
     ↓
[Step 3 name — type — channel]
├─→ [Path A name] → [Step name]
└─→ [Path B name] → [Step name]

**Messages:**
- [Step name]: [channel] — [subject/title] — [key content summary]

**Compliance:**
- ✅/❌ is_legal_drinking_age in entry criteria
- ✅/❌ Responsible drinking footer on all emails
- ✅/❌ Frequency cap applied
- ✅/❌ All Liquid variables have defaults
3. Flag any assumptions or risks
4. Then end your response with the complete JSON payload wrapped in exactly this format:

<canvas_json>
{
  "canvas": {
    ...complete configuration...
  }
}
</canvas_json>

CRITICAL rules for the JSON block:
- Always wrap in <canvas_json> tags — no exceptions
- The JSON must be complete and valid — never truncate it
- Always use segment IDs from the LIVE WORKSPACE CONTEXT section above — never from the knowledge base files. The knowledge base may contain outdated segment IDs. If the user references a segment by name, find it in the live workspace context and use that exact ID.
- Always include is_legal_drinking_age == true in entry criteria for Campari Group
- schedule_type must be one of: "time_based", "action_based", "api_triggered"
- Always wrap the root in a "canvas" key: { "canvas": { ... } }
- Canvas step formats must exactly match the schemas in braze-api-reference.md — delay steps use delay.delay_type/duration/duration_unit, message steps use messages.email or messages.push_ios/push_android, action paths use paths[] array with filters[]
- Never use delay.value, message_content, channels[], or next_step_ids.yes/no — these formats are not supported
- segment_ids must contain segment NAMES as strings, never UUIDs. Write ["CORE_EMAIL_OPTED_IN"] not a UUID. The proxy resolves names to IDs automatically via live workspace lookup.
---
## Brief compliance — CRITICAL
When the user uploads or pastes a campaign brief, follow these rules:
1. Read the brief and identify the exact steps specified
2. Flag any steps or structure that violate best practice — explain clearly why and what the risk is
3. Ask a single confirmation question if you believe the structure should be changed — for example: "The brief specifies no action path. Best practice would add one to catch non-openers. Do you want me to add this, or build exactly as specified?"
4. Wait for the user's answer before producing any JSON
5. Build exactly what was confirmed — no silent additions, no structural changes without explicit approval
6. The Canvas design summary you present before building is a CONTRACT — the JSON must match it exactly, same steps, same order, same channels
7. After the user confirms and before producing the JSON, output a full Campaign Debrief in this format:

---
## Campaign Debrief — [Canvas Name]
**Purpose:** [one sentence objective]
**Brand / Market:** [brand] / [market]
**Audience:** [segment name] ([segment ID]) — [entry filter summary]
**Schedule:** [schedule type] — [start date] to [end date]
**Journey:** [step-by-step description]
**Messages:** [summary of each message — channel, subject/title, key content]
**Compliance:** [checklist of all compliance items confirmed]
**Assumptions:** [any assumptions made]
**Source of truth:** This debrief documents the exact Canvas configuration as confirmed by the user and as built in Braze. It should be retained as the campaign specification.
---

This debrief is the proof of development document. It must be generated on every Canvas build without exception.

## Response style
- Lead with the most important thing
- Use headers and structure when producing configurations or multi-part answers
- Keep conversational replies tight — this is a professional tool, not a chatbot
- When you disagree with what the user wants to do, say so and explain why before proceeding`;
}

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

function httpsRequest(options, body, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Request timed out after ${timeoutMs / 1000}s`)));
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ─── BRAZE API READS ──────────────────────────────────────────────────────────

async function brazeGet(path) {
  return httpsRequest({
    hostname: CONFIG.brazeRestEndpoint,
    path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CONFIG.brazeApiKey}`,
      'Content-Type': 'application/json'
    }
  });
}

async function brazeDashboardGet(urlPath) {
  return httpsRequest({
    hostname: CONFIG.brazeDashboardEndpoint,
    path: urlPath,
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrf-token': CONFIG.brazeCsrfToken,
      'cookie': `_session_id=${CONFIG.brazeSessionId}; remember_login_enc_v1=${CONFIG.brazeRememberToken}; ag_id___6a27c8bab79981004762ea60=${ATTRIBUTES_APP_GROUP_ID}; f_ag_id___6a27c8bab79981004762ea60=${ATTRIBUTES_APP_GROUP_ID}`,
      'user-agent': 'Mozilla/5.0'
    }
  });
}

async function lookupSegmentId(segmentName) {
  const encoded = encodeURIComponent(segmentName);
  const result = await brazeDashboardGet(
    `/engagement/remote_segment_search?app_group_id=${ATTRIBUTES_APP_GROUP_ID}&query=${encoded}&limit=25&skip_count=0`
  );
  const segments = result.body?.segments || [];
  const match = segments.find(s => s.name.toLowerCase() === segmentName.toLowerCase());
  return match?.id || null;
}
async function lookupEmailTemplate(templateId) {
  const result = await brazeGet(`/templates/email/info?email_template_id=${templateId}`);
  return {
    subject: result.body?.subject || '',
    body: result.body?.body || '',
    plaintext_body: result.body?.plaintext_body || ''
  };
}
async function loadWorkspaceContext() {
  try {
    const [campaigns, canvases, segments, customAttributes, customEvents, campaignsAll, canvasesAll] = await Promise.all([
      brazeGet('/campaigns/list?page=0&sort_direction=desc'),
      brazeGet('/canvas/list?page=0&sort_direction=desc'),
      brazeGet('/segments/list?page=0&sort_direction=desc'),
      brazeGet('/custom_attributes?page=0'),
      brazeGet('/events/list?page=0'),
      brazeGet('/campaigns/list?page=0&sort_direction=desc&include_archived=true'),
      brazeGet('/canvas/list?page=0&sort_direction=desc&include_archived=true')
    ]);

    const campaignList = campaigns.body?.campaigns?.slice(0, 20).map(c =>
      `  - ${c.name} (id: ${c.id}, tags: ${c.tags?.join(', ') || 'none'})`
    ).join('\n') || 'Unable to load';

    const canvasList = canvases.body?.canvases?.slice(0, 20).map(c =>
      `  - ${c.name} (id: ${c.id}, tags: ${c.tags?.filter(Boolean).join(', ') || 'none'})`
    ).join('\n') || 'Unable to load';

    const segmentList = segments.body?.segments?.slice(0, 20).map(s =>
      `  - ${s.name} (id: ${s.id}, analytics: ${s.analytics_tracking_enabled})`
    ).join('\n') || 'Unable to load';

   const attrList = customAttributes.body?.attributes?.slice(0, 30).map(a =>
      `  - ${a.name} (type: ${a.data_type}${a.description ? ', desc: ' + a.description : ''})`
    ).join('\n') || 'Unable to load';

    const eventList = customEvents.body?.events?.slice(0, 30).map(e => `  - ${e}`).join('\n') || 'Unable to load';

    const campaignActive = campaigns.body?.campaigns?.length;
    const campaignTotal = campaignsAll.body?.campaigns?.length;
    const campaignArchived = (campaignTotal != null && campaignActive != null) ? campaignTotal - campaignActive : null;

    const canvasActive = canvases.body?.canvases?.length;
    const canvasTotal = canvasesAll.body?.canvases?.length;
    const canvasArchived = (canvasTotal != null && canvasActive != null) ? canvasTotal - canvasActive : null;

    return `### Collected at (UTC)
${new Date().toISOString()}

### Campaign status counts
Total: ${campaignTotal ?? 'Unable to load'}
Active (non-archived): ${campaignActive ?? 'Unable to load'}
Archived: ${campaignArchived ?? 'Unable to load'}

### Canvas status counts
Total: ${canvasTotal ?? 'Unable to load'}
Active (non-archived): ${canvasActive ?? 'Unable to load'}
Archived: ${canvasArchived ?? 'Unable to load'}

### Recent campaigns (up to 20)
${campaignList}

### Recent canvases (up to 20)
${canvasList}

### Segments (up to 20)
${segmentList}

### Custom attributes (up to 30)
${attrList}

### Custom events (up to 30)
${eventList}`;

  } catch (e) {
    return `Unable to load live workspace context: ${e.message}`;
  }
}

// ─── ADDITIONAL LIVE DATA (Braze MCP-equivalent endpoints) ───────────────────
// Fetched on-demand only when the user's question matches one of these patterns —
// existing workspace context and knowledge base loading are unaffected.

function formatKpiSeries(body, field) {
  const points = body?.data || [];
  if (!points.length) return '  Unable to load';
  return points.map(p => `  - ${p.time}: ${p[field]}`).join('\n');
}

async function fetchKpiTrends() {
  const [dau, mau, newUsers, uninstalls] = await Promise.all([
    brazeGet('/kpi/dau/data_series?length=14'),
    brazeGet('/kpi/mau/data_series?length=14'),
    brazeGet('/kpi/new_users/data_series?length=14'),
    brazeGet('/kpi/uninstalls/data_series?length=14')
  ]);
  return `### Daily Active Users (last 14 days)
${formatKpiSeries(dau.body, 'dau')}

### Monthly Active Users (last 14 days)
${formatKpiSeries(mau.body, 'mau')}

### New Users (last 14 days)
${formatKpiSeries(newUsers.body, 'new_users')}

### Uninstalls (last 14 days)
${formatKpiSeries(uninstalls.body, 'uninstalls')}`;
}

async function fetchCatalogs() {
  const result = await brazeGet('/catalogs');
  const catalogs = result.body?.catalogs || [];
  if (!catalogs.length) return '  No catalogs found';
  return catalogs.map(c =>
    `  - ${c.name}: ${c.description || 'no description'} (fields: ${(c.fields || []).map(f => f.name).join(', ') || 'none'})`
  ).join('\n');
}

async function fetchPurchaseProducts() {
  const result = await brazeGet('/purchases/product_list?page=0');
  const products = result.body?.products || [];
  if (!products.length) return '  No products found';
  return products.slice(0, 30).map(p => `  - ${p}`).join('\n');
}

// ─── SAMPLE CANVAS METRICS DATA ───────────────────────────────────────────────

let sampleCanvasDataCache = null;

function loadSampleCanvasData() {
  if (sampleCanvasDataCache) return sampleCanvasDataCache;
  try {
    const raw = fs.readFileSync(path.join(CONFIG.knowledgeDir, 'sample-canvas-data.json'), 'utf8');
    sampleCanvasDataCache = JSON.parse(raw).canvases || [];
  } catch (e) {
    sampleCanvasDataCache = [];
  }
  return sampleCanvasDataCache;
}

const METRICS_INTENT_PATTERN = /metric|performance|open rate|click|conversion|revenue|report|analytics|results|stats|how did|how is/i;

function fetchSampleCanvasContext(text, intent) {
  const canvases = loadSampleCanvasData();
  if (!canvases.length) return '';

  if (intent === 'hypercare_brief') {
    return `\n\n---\n## SAMPLE CANVAS DATA (all canvases)\n\nCurrent date/time (UTC): ${new Date().toISOString()}\n\nUse this dataset for the Launch Hypercare Dashboard. Apply the Canvas Eligibility Rules (archived == false, draft == false, first_entry within the last 72 hours of the current date/time above) to determine which canvases to include.\n\n${JSON.stringify(canvases, null, 2)}`;
  }

  const match = canvases.find(c => text.includes(c.canvas_id));
  if (match) {
    return `\n\n---\n## CANVAS METRICS DATA (sample) — ${match.canvas_id}\n\nThe user referenced this canvas_id from the sample dataset. Only its data (details, data_series, data_summary) is included below. Analyze ONLY this canvas — do not reference any other canvas from the sample dataset.\n\n${JSON.stringify(match, null, 2)}`;
  }

  if (METRICS_INTENT_PATTERN.test(text)) {
    const list = canvases.map(c => `  - ${c.canvas_id}: ${c.canvas_name}`).join('\n');
    return `\n\n---\n## AVAILABLE SAMPLE CANVASES\n\nNo specific canvas_id was referenced. If the user is asking about canvas metrics, show them this list and ask which canvas they'd like analyzed (or use the canvas_id directly if they provide one):\n${list}`;
  }

  return '';
}

const LIVE_DATA_FETCHERS = [
  {
    heading: 'KPI TRENDS',
    pattern: /\b(dau|mau|daily active users?|monthly active users?|active users?|new users?|uninstalls?)\b/i,
    fetch: fetchKpiTrends
  },
  {
    heading: 'CATALOGS',
    pattern: /\bcatalogs?\b/i,
    fetch: fetchCatalogs
  },
  {
    heading: 'PURCHASE DATA',
    pattern: /\b(purchase|purchases|product list|revenue series|quantity series)\b/i,
    fetch: fetchPurchaseProducts
  }
];

async function fetchExtraLiveData(messages, intent) {
  const lastUserMessage = messages?.slice?.()?.reverse?.()?.find?.(m => m.role === 'user');
  const text = (typeof lastUserMessage?.content === 'string'
    ? lastUserMessage.content
    : lastUserMessage?.content?.map?.(c => c.text || '').join(' ') || ''
  );

  let extra = '';
  for (const fetcher of LIVE_DATA_FETCHERS) {
    if (fetcher.pattern.test(text)) {
      try {
        const data = await fetcher.fetch();
        extra += `\n\n---\n## ${fetcher.heading} (live)\n\n${data}`;
      } catch (e) {
        extra += `\n\n---\n## ${fetcher.heading}\n\nUnable to fetch live data: ${e.message}`;
      }
    }
  }
  extra += fetchSampleCanvasContext(text, intent);
  return extra;
}

// ─── CUSTOM ATTRIBUTE USAGE SCRAPER ───────────────────────────────────────────

async function scrapeUnusedAttributes() {
  const listPath =
    `/app_settings/custom_attributes_data?limit=1000&sortby=name&sortdir=1&start=0` +
    `&app_group_id=${ATTRIBUTES_APP_GROUP_ID}` +
    `&query%5B0%5D%5Bkey%5D=blacklisted&query%5B0%5D%5Bvalue%5D=all` +
    `&query%5B1%5D%5Bkey%5D=&query%5B1%5D%5Bvalue%5D=`;

  const listResult = await brazeDashboardGet(listPath);
  const all = listResult.body.results || [];

  const unused = [];
  for (const attr of all) {
    const encoded = encodeURIComponent(attr.name);
    const usageResult = await brazeDashboardGet(
      `/app_settings/custom_attributes_values?name=${encoded}&app_group_id=${ATTRIBUTES_APP_GROUP_ID}`
    );
    const usage = usageResult.body;
    if (usage && typeof usage.total === 'number' && usage.total === 0) unused.push(attr);
  }

  const typeMap = { TrueClass: 'Boolean', FalseClass: 'Boolean', String: 'String', Integer: 'Integer', Array: 'Array', Time: 'Date/Time' };
  const rows = unused.length
    ? unused.map(a => `| \`${a.name}\` | ${typeMap[a.detected_data_type] || a.detected_data_type || '—'} | ${a.updated_at ? new Date(a.updated_at).toLocaleDateString('en-GB') : 'Never'} |`).join('\n')
    : '| — | No unused attributes found | — |';

  const md = `# Unused Braze Custom Attributes

> **Generated:** ${new Date().toLocaleString('en-GB')}
> **Total scanned:** ${all.length} | **Unused:** ${unused.length}

---

| Attribute Name | Type | Last Updated |
|----------------|------|--------------|
${rows}
`;

  fs.writeFileSync(path.join(CONFIG.knowledgeDir, 'unused-attributes.md'), md, 'utf8');
  return { total: all.length, unused: unused.length, attributes: unused };
}

// ─── ORPHAN SEGMENT SCRAPER ───────────────────────────────────────────────────

async function scrapeUnusedSegments() {
  const listPath =
    `/engagement/segments` +
    `?query%5B0%5D%5Bkey%5D=status&query%5B0%5D%5Bvalue%5D=active` +
    `&query%5B1%5D%5Bkey%5D=&query%5B1%5D%5Bvalue%5D=` +
    `&limit=1000&start=0&sortby=last_edited&sortdir=-1` +
    `&app_group_id=${ATTRIBUTES_APP_GROUP_ID}` +
    `&fields=description%2Ctags%2Cname%2Cmarked_as_deleted%2Clast_edited_by%2Clast_edited`;

  const listResult = await brazeDashboardGet(listPath);
  const all = listResult.body.results || [];

  const unused = [];
  for (const seg of all) {
    const usageResult = await brazeDashboardGet(`/engagement/segments/${seg.id}/engagements?app_group_id=${ATTRIBUTES_APP_GROUP_ID}`);
    const usage = usageResult.body;
    const isUnused =
      usage.campaigns_using_segment?.count === 0 &&
      usage.cards_using_segment?.count === 0 &&
      usage.workflows_using_segment?.count === 0 &&
      usage.segments_using_segment?.count === 0;
    if (isUnused) unused.push(seg);
  }

  const rows = unused.length
    ? unused.map(s => `| \`${s.name}\` | ${s.description || '—'} | ${s.last_edited ? new Date(s.last_edited).toLocaleDateString('en-GB') : 'Never'} | ${s.last_edited_by?.developer_name || '—'} |`).join('\n')
    : '| — | No unused segments found | — | — |';

  const md = `# Unused Braze Segments

> **Generated:** ${new Date().toLocaleString('en-GB')}
> **Total scanned:** ${all.length} | **Unused:** ${unused.length}

---

| Segment Name | Description | Last Edited | Last Edited By |
|--------------|-------------|-------------|-----------------|
${rows}
`;

  fs.writeFileSync(path.join(CONFIG.knowledgeDir, 'unused-segments.md'), md, 'utf8');
  return { total: all.length, unused: unused.length, segments: unused };
}

// ─── BRAZE CANVAS WRITE ───────────────────────────────────────────────────────
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function createCanvas(canvasPayload) {
  const canvas = canvasPayload.canvas || canvasPayload;
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2, 18);
  const workflowId = generateObjectId();
  const apiWorkflowId = generateUUID();
  const changelogId = generateObjectId();
  const startTime = Math.floor(Date.now() / 1000) + 300;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ── Map copilot steps to Braze internal step format ──────────────────────
  // Handle steps nested inside variants (copilot sometimes outputs this format)
  const copilotSteps = canvas.steps || canvas.variants?.[0]?.steps || [];
  // Resolve segment names to sandbox IDs via live search
  const rawSegmentIds = canvas.entry_audience?.segment_ids || [];
const resolvedSegmentIds = await Promise.all(
    rawSegmentIds.map(async id => {
      const uuidPattern = /^[0-9a-f-]{36}$/i;
      if (uuidPattern.test(id)) {
        console.warn(`Segment UUID "${id}" rejected — proxy requires segment names not UUIDs`);
        return null;
      }
      try {
        const resolved = await lookupSegmentId(id);
        if (resolved) {
          console.log(`Resolved segment "${id}" → ${resolved}`);
          return resolved;
        }
        console.warn(`Segment "${id}" not found in sandbox — skipping`);
        return null;
      } catch (e) {
        console.warn(`Segment lookup failed for "${id}": ${e.message} — skipping`);
        return null;
      }
    })
  );
  const validSegmentIds = resolvedSegmentIds.filter(Boolean);


  // Build a lookup from copilot step id/name → generated Braze stepId
  const stepIdMap = {};
  copilotSteps.forEach((s, i) => {
    const key = s.id || s.name || `step_${i}`;
    stepIdMap[key] = generateObjectId();
  });
   const messageConnectorMap = {};

  // Helper to resolve next_step_id to a generated Braze ObjectId
 function resolveNextId(nextStepRef) {
    if (!nextStepRef) return null;
    if (messageConnectorMap[nextStepRef]) return messageConnectorMap[nextStepRef];
    if (stepIdMap[nextStepRef]) return stepIdMap[nextStepRef];
    const match = copilotSteps.find(s => s.name === nextStepRef || s.id === nextStepRef);
    if (match) {
      const key = match.id || match.name;
      if (messageConnectorMap[key]) return messageConnectorMap[key];
      return stepIdMap[key];
    }
    return null;
  }

  // Build Braze steps array from copilot steps
 let brazeSteps = [];
  let firstMessageStepId = null;
  let firstCanvasStepId = null;

  for (let i = 0; i < copilotSteps.length; i++) {
    const step = copilotSteps[i];
    const key = step.id || step.name || `step_${i}`;
    const stepId = stepIdMap[key];
    const nextId = resolveNextId(step.next_step_id || step.next_step);
    const nextIds = nextId ? [nextId] : [];
    const row = i;
    const col = 3;
if (!firstCanvasStepId) firstCanvasStepId = stepId;
    const type = (step.type || '').toLowerCase();

    if (type === 'delay') {
      const durationSecs = (() => {
        const d = step.delay || {};
        const inner = typeof d.duration === 'object' ? d.duration : d;
       const val = inner.duration || inner.value || d.duration || d.value || 0;
const unit = (inner.unit || inner.duration_unit || d.unit || d.duration_unit || 'minutes').toLowerCase();
        if (unit === 'minutes') return val * 60;
        if (unit === 'hours') return val * 3600;
        if (unit === 'days') return val * 86400;
        if (unit === 'weeks') return val * 604800;
        return val * 60;
      })();

      brazeSteps.push({
        step_id: stepId,
        step_name: step.name || 'Delay',
        next_step_ids: nextIds,
        row, column: col,
        is_control_step: false,
        type: 'DELAY',
        id_eagerly_created: true,
        step_data: {
          delay_in_seconds: durationSecs,
          specific_time: null,
          in_local_time: null,
          delay_until: null,
          delay_until_iso: null,
          delay_until_next_day: null,
          advance_same_day: null,
          delay_as_minimum_duration: true,
          delay_until_variable: null,
          delay_until_variable_type: null,
          duration_variable: null,
          duration_variable_type: null,
          duration_variable_unit: null
        },
        is_disconnected: false
      });

    } else if (type === 'message') {
      if (!firstMessageStepId) firstMessageStepId = stepId;
      const messageStepId = generateObjectId(); // separate ID for the MESSAGE connector
      messageConnectorMap[key] = messageStepId;

      const channels = step.message_content || step.channels || step.messages || {};
      const email = channels.email || {};
      const push = channels.push || {};
      const pushIos = push.ios || channels.push_ios || {};
      const pushAndroid = push.android || channels.push_android || {};
const pushAlert = push.alert || push.body || '';
const pushTitle = push.title || '';
if (pushAlert && !pushIos.alert) pushIos.alert = pushAlert;
if (pushTitle && !pushIos.title) pushIos.title = pushTitle;
if (pushAlert && !pushAndroid.alert) pushAndroid.alert = pushAlert;
if (pushTitle && !pushAndroid.title) pushAndroid.title = pushTitle;
      const messagingActions = [];

if (email.email_template_id && !email.body) {
        try {
          const template = await lookupEmailTemplate(email.email_template_id);
          if (template.body) {
            email.body = template.body;
            email.subject = email.subject || template.subject;
            email.plaintext_body = email.plaintext_body || template.plaintext_body;
          }
        } catch (e) {
          console.warn(`Failed to load template ${email.email_template_id}: ${e.message}`);
        }
      }

     if (email.subject || email.body) {
        const fromRaw = email.from || email.from_address || 'test_user@mail.development.braze.com';
        const fromAddress = fromRaw.replace(/.*<(.+)>.*/, '$1').replace(/<[^>]*>/g, '').trim();
        const fromName = fromRaw.includes('<') ? fromRaw.replace(/<.*>/, '').trim() : 'Braze';
        messagingActions.push({
          variation_id: `message-${Math.floor(Math.random() * 90000) + 10000}`,
          message_type: 'email',
          send_percentage: 0,
          is_active: true,
          link_template_ids: [],
          link_config_set: {},
          draft_link_management_data: '',
          variant_group_id: null,
          from_display_name: fromName,
          from_address: fromAddress,
          reply_to_address: email.reply_to || null,
          bcc_address: null,
          should_send_to_seed_groups: false,
          seed_group_ids: [],
          is_control: null,
          last_sent_email: null,
          has_included_amp: null,
          ip_pool_name: 'development',
          multi_language_composition_setup: null,
          link_includer_sequence_base: 0,
          link_includer_sequence_offset: 1,
          content_block_inclusion_sequence_base: 0,
          content_block_inclusion_sequence_offset: 0,
          draft_content_block_mapping: {},
          links: [],
          tracked_link_count: null,
          email_attachments: null,
          email_subject: email.subject || '',
          email_body: email.body || '',
          email_amp_body: '',
          dnd_template_json: null,
          is_dnd_template: false,
          plaintext_body: email.plaintext_body || '',
          preheader: email.preheader || '',
          should_whitespace_preheader: false,
          list_unsubscribe_header_config: { scope: 0 },
          should_inline_css: email.should_inline_css !== false
        });
      }

      if (pushIos.alert || pushIos.title) {
        messagingActions.push({
          variation_id: `message-${Math.floor(Math.random() * 90000) + 10000}`,
          message_type: 'iosPush',
          send_percentage: 0,
          is_active: true,
          link_template_ids: [],
          link_config_set: {},
          draft_link_management_data: '',
          ios_push_message: pushIos.alert || '',
          ios_push_category: null,
          ios_alert_hash: { title: pushIos.title || '' },
          ios_uri_type: 'NONE',
          multi_language_composition_setup: null,
          ios_uri: pushIos.deep_link || null,
          ios_use_webview: true,
          ios_only_most_recent_device: false,
          ios_only_ipads: false,
          ios_only_iphones: false,
          ios_push_buttons: [],
          ios_interruption_level: 'active'
        });
      }

      if (pushAndroid.alert || pushAndroid.title) {
        messagingActions.push({
          variation_id: `message-${Math.floor(Math.random() * 90000) + 10000}`,
          message_type: 'androidPush',
          send_percentage: 0,
          is_active: true,
          link_template_ids: [],
          link_config_set: {},
          draft_link_management_data: '',
          android_title: pushAndroid.title || '',
          android_push_message: pushAndroid.alert || '',
          android_priority: 0,
          android_uri_type: 'NONE',
          android_custom_uri: pushAndroid.deep_link || null,
          android_only_most_recent_device: false,
          android_use_webview: true,
          is_notification_channel_dynamic: false,
          android_carousel_type: null,
          notification_channel_id: null,
          android_time_to_live: pushAndroid.time_to_live || 2419200,
          android_fcm_priority: 'normal',
          android_push_buttons: [],
          multi_language_composition_setup: null
        });
      }

      // FULL step with message content
      brazeSteps.push({
        step_id: stepId,
        step_name: step.name || 'Message',
        next_step_ids: [],
        row, column: col,
        is_control_step: false,
        type: 'FULL',
        id_eagerly_created: true,
        push_max_enabled: false,
        banner_priority_bucket: 2,
        banner_priority_for_unpersisted_step: null,
        ms_id: messageStepId,
        forced_advancement_behavior: true,
        messages: messagingActions.length > 0
          ? { messaging_actions: messagingActions, composition_mode: 'quick-push-multichannel' }
          : { unchanged: true },
        segment_ids: [],
        attached_images_ids: [],
        ignore_workflow_quiet_time: false,
        trigger_schedule: {
          start_time: startTime,
          limit_end: false, end_time: null,
          deliver_in_local_time: true,
          send_after_quiet_time: false,
          quiet_start_hour: 0, quiet_start_minute: '00',
          quiet_end_hour: 8, quiet_end_minute: '00',
          trigger_events: [], exception_events: [],
          trigger_delay_in_seconds: 0, duration_in_seconds: 0,
          reevaluate_segment_at_send_time: true,
          evaluate_segment_at_enqueue_time: false,
          delivery_time_without_zone: null,
          delivery_day: null, deliver_in_days: null,
          optimal_time_notification: false,
          delay_option: 'immediately',
          retry_window_seconds: 0
        },
        delivery_validation_failure_behavior: 'exit',
        using_v2_filters: true,
        filters: null,
        exclusion_filters: null
      });

      // MESSAGE connector step — different step_id, points to next step
      brazeSteps.push({
        step_id: messageStepId,
        step_name: step.name || 'Message',
        next_step_ids: nextIds,
        row, column: col,
        is_control_step: false,
        type: 'MESSAGE',
        id_eagerly_created: true,
        push_max_enabled: false,
        banner_priority_bucket: 2,
        banner_priority_for_unpersisted_step: null,
        is_disconnected: false
      });

    } else if (type === 'action_path' || type === 'audience_path' || type === 'decision_split') {
     const paths = step.paths || step.action_path?.paths || step.action_path_settings?.paths || step.audience_path_settings?.paths || [];
const window = step.window || step.action_path?.action_window || step.action_path?.window || step.action_path_settings?.window || {};
      const durationSecs = (() => {
        const val = window.duration || 1;
        const unit = (window.unit || window.duration_unit || 'days').toLowerCase();
        if (unit === 'hours') return val * 3600;
        if (unit === 'days') return val * 86400;
        return val * 86400;
      })();

      // Find the previous message step ID for email open tracking
      const prevMessageStepId = (() => {
        for (let j = i - 1; j >= 0; j--) {
          if ((copilotSteps[j].type || '').toLowerCase() === 'message') {
            const key = copilotSteps[j].id || copilotSteps[j].name || `step_${j}`;
            return stepIdMap[key];
          }
        }
        return null;
      })();

      const actionPaths = paths.map(p => {
        const filters = p.filters || [];
        const nextId = resolveNextId(p.next_step || p.next_step_id) || null;

        // Determine trigger event type from filter
        const triggerEvents = filters.map(f => {
          if (f.type === 'email_open' || f.type === 'email_opened') {
            return {
              event_type: 'TrackedUserBehavior::InteractedWithWorkflowStep',
              blocklisted: false,
              has_hard_deleted_data: false,
              interaction: 'oe',
              workflow_step_id: prevMessageStepId
            };
          }
          if (f.type === 'email_click' || f.type === 'email_clicked') {
            return {
              event_type: 'TrackedUserBehavior::InteractedWithWorkflowStep',
              blocklisted: false,
              has_hard_deleted_data: false,
              interaction: 'ce',
              workflow_step_id: prevMessageStepId
            };
          }
          if (f.type === 'custom_event') {
            return {
              event_type: 'TrackedUserBehavior::PerformedCustomEvent',
              blocklisted: false,
              has_hard_deleted_data: false,
              custom_event_name: f.custom_event_name || ''
            };
          }
          return null;
        }).filter(Boolean);

        return {
          id: generateObjectId(),
          name: p.name || 'Path',
          exits_canvas: false,
          next_step_id: nextId,
          trigger_events: triggerEvents
        };
      });

      brazeSteps.push({
        step_id: stepId,
        step_name: step.name || 'Action Path',
        next_step_ids: [],
        row, column: col,
        is_control_step: false,
        type: 'ACTION_PATHS',
        id_eagerly_created: true,
        step_data: {
          has_ranked_order: false,
          advance_immediately: false,
          everyone_else_exits_canvas: false,
          action_paths: actionPaths,
          duration_in_seconds: durationSecs,
          duration_variable: null,
          duration_variable_type: null,
          duration_variable_unit: null
        },
        is_disconnected: false
      });

    } else if (type === 'exit') {
      // Exit steps are not sent to Braze — they are implicit
      // Skip
    } else {
      // Unknown step type — add as a generic FULL step
      brazeSteps.push({
        step_id: stepId,
        step_name: step.name || 'Step',
        next_step_ids: nextIds,
        row, column: col,
        is_control_step: false,
        type: 'FULL',
        id_eagerly_created: true,
        push_max_enabled: false,
        banner_priority_bucket: 2,
        banner_priority_for_unpersisted_step: null,
        ms_id: nextIds[0] || null,
        forced_advancement_behavior: true,
        messages: { messaging_actions: [], composition_mode: 'quick-push-multichannel' },
        segment_ids: [],
        attached_images_ids: [],
        ignore_workflow_quiet_time: false,
        trigger_schedule: {
          start_time: startTime,
          limit_end: false, end_time: null,
          deliver_in_local_time: true,
          send_after_quiet_time: false,
          quiet_start_hour: 0, quiet_start_minute: '00',
          quiet_end_hour: 8, quiet_end_minute: '00',
          trigger_events: [], exception_events: [],
          trigger_delay_in_seconds: 0, duration_in_seconds: 0,
          reevaluate_segment_at_send_time: true,
          evaluate_segment_at_enqueue_time: false,
          delivery_time_without_zone: null, delivery_day: null, deliver_in_days: null,
          optimal_time_notification: false,
          delay_option: 'immediately',
          retry_window_seconds: 0
        },
        delivery_validation_failure_behavior: 'exit',
        using_v2_filters: true,
        filters: null, exclusion_filters: null
      });
    }
  }

  // Fallback — if no steps from payload, use the original generic shell
  if (brazeSteps.length === 0) {
    const stepId1 = generateObjectId();
    const stepId2 = generateObjectId();
    firstMessageStepId = stepId2;
    brazeSteps = [
      {
        step_id: stepId1,
        step_name: 'Entry',
        next_step_ids: [stepId2],
        row: 0, column: 3,
        is_control_step: false, type: 'FULL', id_eagerly_created: true,
        push_max_enabled: false, banner_priority_bucket: 2,
        banner_priority_for_unpersisted_step: null, ms_id: stepId2,
        forced_advancement_behavior: true,
        messages: { messaging_actions: [], composition_mode: 'quick-push-multichannel' },
        segment_ids: [], attached_images_ids: [],
        ignore_workflow_quiet_time: false,
        trigger_schedule: {
          start_time: startTime, limit_end: false, end_time: null,
          deliver_in_local_time: true, send_after_quiet_time: false,
          quiet_start_hour: 0, quiet_start_minute: '00', quiet_end_hour: 8, quiet_end_minute: '00',
          trigger_events: [], exception_events: [],
          trigger_delay_in_seconds: 0, duration_in_seconds: 0,
          reevaluate_segment_at_send_time: true, evaluate_segment_at_enqueue_time: false,
          delivery_time_without_zone: null, delivery_day: null, deliver_in_days: null,
          optimal_time_notification: false, delay_option: 'immediately', retry_window_seconds: 0
        },
        delivery_validation_failure_behavior: 'exit',
        using_v2_filters: true, filters: null, exclusion_filters: null
      },
      {
        step_id: stepId2, step_name: 'Message', next_step_ids: [], row: 1, column: 3,
        is_control_step: false, type: 'MESSAGE', id_eagerly_created: true,
        push_max_enabled: false, banner_priority_bucket: 2,
        banner_priority_for_unpersisted_step: null, is_disconnected: false
      }
    ];
  }

  // ── Build variants ────────────────────────────────────────────────────────
  const copilotVariants = canvas.variants || [];
  let variants;

  if (copilotVariants.length >= 2) {
    // Use copilot variants (treatment + control)
    const variantIds = copilotVariants.map(() => generateObjectId());
    variants = copilotVariants.map((v, i) => ({
      id: variantIds[i],
      name: v.name || `Variant ${i + 1}`,
      send_percentage: v.percentage || v.weight || (i === 0 ? 90 : 10),
      initial_send_percentage: v.percentage || v.weight || (i === 0 ? 90 : 10),
      first_step_ids: [],
     first_canvas_step_id: firstCanvasStepId || brazeSteps[0]?.step_id || null,
      is_control: v.name?.toLowerCase().includes('control') || false
    }));
  } else {
    const variantId = generateObjectId();
    variants = [{
      id: variantId,
      name: 'Variant 1',
      send_percentage: 100,
      initial_send_percentage: 100,
      first_step_ids: [],
first_canvas_step_id: firstCanvasStepId || brazeSteps[0]?.step_id || null,
      is_control: false
    }];
  }

 const canvasStartUnix = canvas.start_time ? Math.floor(new Date(canvas.start_time).getTime() / 1000) : null;
  const canvasEndUnix = canvas.end_time ? Math.floor(new Date(canvas.end_time).getTime() / 1000) : null;
  const schedule = JSON.stringify({
    send_immediately: false,
    recurring: false,
    frequency: '',
    end_date: tomorrow,
    deliver_in_local_time: false,
    end_condition: 'never',
    optimal_time_notification: false,
    sunday: false, monday: false, tuesday: false,
    wednesday: false, thursday: false, friday: false, saturday: false,
    start_date_unix: canvasStartUnix,
    end_date_unix: canvasEndUnix,
    next_send_occurence: null
  });

  // ── Build conversion behaviors ────────────────────────────────────────────
const conversionBehaviors = (canvas.send_settings?.conversion_events || []).map(e => ({
    event_type: 'TrackedUserBehavior::PerformedCustomEvent',
    blocklisted: null,
    has_hard_deleted_data: null,
    custom_event_name: e.custom_event_name || '',
    property_filters: [],
    unadjusted_behavior_window_in_seconds: (e.conversion_deadline || 168) * 3600,
    performed_behavior_window_in_seconds: (e.conversion_deadline || 168) * 3600
  })).filter(e => e.custom_event_name);

  // ── Build quiet time ──────────────────────────────────────────────────────
  const quietHours = canvas.send_settings?.quiet_hours || {};
  const quietTimeData = JSON.stringify({
    has_quiet_time: quietHours.enabled || false,
    send_after_quiet_time: false,
    quiet_start_hour: quietHours.start_time ? parseInt(quietHours.start_time.split(':')[0]) : 21,
    quiet_start_minute: quietHours.start_time ? quietHours.start_time.split(':')[1] : '00',
    quiet_end_hour: quietHours.end_time ? parseInt(quietHours.end_time.split(':')[0]) : 8,
    quiet_end_minute: quietHours.end_time ? quietHours.end_time.split(':')[1] : '00'
  });

  // ── Assemble fields ───────────────────────────────────────────────────────
  const fields = {
    authenticity_token: CONFIG.brazeCsrfToken,
    workflow_id: `"${workflowId}"`,
    create_version: 'false',
    api_workflow_id: `"${apiWorkflowId}"`,
    workflow_name: `"${(canvas.name || 'Copilot Canvas').replace(/"/g, '\\"')}"`,
    workflow_description: canvas.description ? `"${canvas.description.replace(/"/g, '\\"')}"` : 'null',
   segment_ids: JSON.stringify(validSegmentIds.map(id => [id])),
    match_more_than_once: 'false',
    can_match_again_after_seconds: '0',
    schedule_type: '"time_based"',
    recipient_subscription_state: '1',
    ignore_global_frequency_capping: 'false',
    exclude_from_global_frequency_count: 'false',
    enabled: 'false',
    is_draft: 'true',
    version: '"flow"',
    tag_names: JSON.stringify(canvas.tags || []),
    has_recipients_limit: 'false',
    max_recipients: 'null',
    max_recipients_is_global: 'null',
    volume_limit_daily: 'null',
    recipient_limit_frequency: 'null',
    time_rate_limit: 'null',
    channel_rate_limits: '{}',
    territory_ids: '[]',
    match_again_is_max_duration: 'true',
    seed_exclude_already_sent_not_updated: 'true',
    automatic_distribution_optimization: 'false',
    iam_step_ids_in_priority_order: '[]',
    priority_bucket: '2',
    message_priority_opt_in: 'false',
    message_priority_category_id: 'null',
    priority_for_unpersisted_workflow: 'null',
    has_advanced_to_grid_view: 'true',
    maximum_duration: '0',
    last_edit_changelog_id: `"${changelogId}"`,
    is_currently_expired: 'false',
    last_offloaded_retargeting_data_at: '0',
    last_deleted_summaries_at: '0',
    start_offloading_retargeting_data_at: '0',
    ready_to_offload_retargeting_data: 'null',
    conversion_behaviors: JSON.stringify(conversionBehaviors),
  exit_criteria: '{"segment_ids":[],"exit_event":[],"filters_unchanged":true,"using_v2_filters":false}',
    filters_unchanged: 'true',
    using_v2_filters: 'false',
    schedule: schedule,
    steps: JSON.stringify(brazeSteps),
    step_count: String(brazeSteps.length),
    deletion_move_to_map: '{}',
    variations: JSON.stringify(variants),
    quiet_time_data: quietTimeData,
    is_save_or_launch_active_draft: 'false'
  };

  let body = '';
  for (const [key, value] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${value}\r\n`;
  }
  body += `--${boundary}--\r\n`;

  const result = await httpsRequest({
    hostname: CONFIG.brazeDashboardEndpoint,
    path: `/engagement/canvas?app_group_id=6a003bbcb79981004762f2b4`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body),
      'Cookie': `_session_id=${CONFIG.brazeSessionId}; remember_login_enc_v1=${CONFIG.brazeRememberToken}; ag_id___6a27c8bab79981004762ea60=6a003bbcb79981004762f2b4; f_ag_id___6a27c8bab79981004762ea60=6a003bbcb79981004762f2b4`,
      'X-CSRF-Token': CONFIG.brazeCsrfToken,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
      'Origin': `https://${CONFIG.brazeDashboardEndpoint}`,
      'Referer': `https://${CONFIG.brazeDashboardEndpoint}/engagement/canvas`,
      'ab-app-group-id': '6a003bbcb79981004762f2b4',
      'ab-version': 'de1c71f99918eff396e448bc345a53b60aa72d83'
    }
  }, body);

  console.log('Braze response status:', result.status);
  console.log('Braze response body:', JSON.stringify(result.body).slice(0, 500));
  console.log('Steps mapped:', brazeSteps.length);

  return { ...result, workflowId };
}
// ─── CLAUDE API ───────────────────────────────────────────────────────────────

async function callClaude(messages, systemPrompt) {
  const body = {
    model: 'claude-sonnet-4-5',
    max_tokens: 8192,
    system: systemPrompt,
    messages,
    mcp_servers: [
      {
        "type":"url",
        "name":"braze-mcp",
        "url": "https://vmlmap-braze-mcp-wrapper-979737143073.europe-west1.run.app/mcp"
      }
    ],
    tools:[
      {
        "type": "mcp_toolset",
        "mcp_server_name": "braze-mcp"
      }
    ]
  };

  const bodyStr = JSON.stringify(body);
  return httpsRequest({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'x-api-key': CONFIG.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      "anthropic-beta": "mcp-client-2025-11-20"
    }
  }, bodyStr, 180000);
}

// ─── REQUEST ROUTER ───────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS — allow local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Serve frontend files ──────────────────────────────────────────────────
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  const STATIC_MIME_TYPES = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.css': 'text/css', '.js': 'application/javascript'
  };
  if (req.method === 'GET' && STATIC_MIME_TYPES[path.extname(pathname).toLowerCase()]) {
    const publicDir = path.join(__dirname, '../public');
    const filePath = path.join(publicDir, pathname);
    if (filePath.startsWith(publicDir) && fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': STATIC_MIME_TYPES[path.extname(pathname).toLowerCase()] });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  // ── Health check ──────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // ── Load workspace context ────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/context') {
    try {
      const context = await loadWorkspaceContext();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ context }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Chat with copilot ─────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/chat') {
    try {
      const body = await parseBody(req);
      const { messages, workspaceContext } = body;

      const intent = classifyIntent(messages);
      const extraContext = await fetchExtraLiveData(messages, intent);
      const systemPrompt = buildSystemPrompt(workspaceContext || 'Workspace context not loaded.', intent) + extraContext;
      console.log('Intent classified:', intent);
      const result = await callClaude(messages, systemPrompt);

      if (result.status !== 200) {
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Claude API error', detail: result.body }));
        return;
      }

      const reply = result.body.content?.[0]?.text || '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reply, usage: result.body.usage }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Build Canvas ──────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/canvas/build') {
    try {
      const body = await parseBody(req);
      const { canvasPayload } = body;

      if (!canvasPayload) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'canvasPayload required' }));
        return;
      }

     const result = await createCanvas(canvasPayload);
      console.log('Canvas payload received:', JSON.stringify(canvasPayload).slice(0, 500));
      const canvasUrl = result.workflowId
        ? `https://wpp-hackathon-dashboard.k8s.tools-001.d-use-1.braze-dev.com/engagement/canvas/${result.workflowId}/6a003bbcb79981004762f2b4`
        : null;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: result.status, response: result.body, canvasUrl }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Braze API passthrough (read operations) ───────────────────────────────
  if (req.method === 'GET' && pathname.startsWith('/api/braze/')) {
    try {
      const brazePath = '/' + pathname.replace('/api/braze/', '');
      const result = await brazeGet(brazePath + (parsed.search || ''));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.body));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
// ── Update config at runtime ──────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/config') {
    try {
      const body = await parseBody(req);
      if (body.sessionId) CONFIG.brazeSessionId = body.sessionId;
      if (body.csrfToken) CONFIG.brazeCsrfToken = body.csrfToken;
      console.log('Config updated — session and CSRF token refreshed');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  // ── Scrape unused custom attributes ───────────────────────────────────────
  if (req.method === 'GET' && pathname === '/scrape-attributes') {
    try {
      const result = await scrapeUnusedAttributes();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  // ── Scrape orphan segments ────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/scrape-segments') {
    try {
      const result = await scrapeUnusedSegments();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  // ── 404 ───────────────────────────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

// ─── START ────────────────────────────────────────────────────────────────────

const server = http.createServer(handleRequest);

server.listen(CONFIG.port, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           Braze Copilot — Local Proxy Server             ║
╠══════════════════════════════════════════════════════════╣
║  Running on:  http://localhost:${CONFIG.port}                     ║
║  Frontend:    http://localhost:${CONFIG.port}/                     ║
║  Health:      http://localhost:${CONFIG.port}/health               ║
╠══════════════════════════════════════════════════════════╣
║  PRE-DEMO CHECKLIST:                                     ║
║  □ BRAZE_API_KEY set                                     ║
║  □ BRAZE_SESSION_ID refreshed from DevTools              ║
║  □ BRAZE_CSRF_TOKEN refreshed from DevTools              ║
║  □ ANTHROPIC_API_KEY set                                 ║
║  □ Knowledge MD files completed                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
