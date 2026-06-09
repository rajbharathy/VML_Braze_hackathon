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
  brazeApiKey: process.env.BRAZE_API_KEY ,
  brazeRestEndpoint: process.env.BRAZE_REST_ENDPOINT || 'rest.fra-01.braze.eu',

  // Braze Dashboard (write operations — grab from DevTools Network tab on demo day)
  brazeSessionId: process.env.BRAZE_SESSION_ID || 'YOUR_SESSION_ID_COOKIE',
  brazeCsrfToken: process.env.BRAZE_CSRF_TOKEN || 'YOUR_CSRF_TOKEN',
  brazeDashboardEndpoint: process.env.BRAZE_DASHBOARD_ENDPOINT || 'dashboard-01.braze.eu',

  // Claude API
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ,

  // Server
  port: 3000,
  knowledgeDir: path.join(__dirname, '../knowledge')
};

// ─── KNOWLEDGE LOADER ─────────────────────────────────────────────────────────

function loadKnowledge() {
  const files = ['best-practice.md', 'client-context.md', 'ecosystem-architecture.md', 'braze-api-reference.md'];
  return files.map(f => {
    try {
      const content = fs.readFileSync(path.join(CONFIG.knowledgeDir, f), 'utf8');
      return `\n\n---\n## ${f.replace('.md', '').replace(/-/g, ' ').toUpperCase()}\n\n${content}`;
    } catch (e) {
      return `\n\n---\n## ${f} — NOT FOUND`;
    }
  }).join('');
}

function buildSystemPrompt(brazeContext) {
  const knowledge = loadKnowledge();
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

## Canvas building capability
You can build complete Canvases in Braze. When asked to build a Canvas:
1. First confirm you have everything you need: objective, audience, channels, timing, message content direction
2. Walk through your reasoning: why this structure, why these segments, why this timing
3. Produce the complete Canvas configuration
4. Flag any assumptions you made and any risks to review before launch

## Response style
- Lead with the most important thing
- Use headers and structure when producing configurations or multi-part answers
- Keep conversational replies tight — this is a professional tool, not a chatbot
- When you disagree with what the user wants to do, say so and explain why before proceeding`;
}

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
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

async function loadWorkspaceContext() {
  try {
    const [campaigns, canvases, segments, customAttributes] = await Promise.all([
      brazeGet('/campaigns/list?page=0&sort_direction=desc'),
      brazeGet('/canvas/list?page=0&sort_direction=desc'),
      brazeGet('/segments/list?page=0&sort_direction=desc'),
      brazeGet('/custom_attributes?page=0')
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

    return `### Recent campaigns (up to 20)
${campaignList}

### Recent canvases (up to 20)
${canvasList}

### Segments (up to 20)
${segmentList}

### Custom attributes (up to 30)
${attrList}`;

  } catch (e) {
    return `Unable to load live workspace context: ${e.message}`;
  }
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
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2, 18);
  const workflowId = generateObjectId();
  const apiWorkflowId = generateUUID();
  const changelogId = generateObjectId();
  const stepId1 = generateObjectId();
  const stepId2 = generateObjectId();
  const variantId = generateObjectId();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const startTime = Math.floor(Date.now() / 1000) + 300;

  const steps = JSON.stringify([
    {
      step_id: stepId1,
      step_name: "Entry",
      next_step_ids: [stepId2],
      row: 0,
      column: 3,
      is_control_step: false,
      type: "FULL",
      id_eagerly_created: true,
      push_max_enabled: false,
      banner_priority_bucket: 2,
      banner_priority_for_unpersisted_step: null,
      ms_id: stepId2,
      forced_advancement_behavior: true,
      messages: { messaging_actions: [], composition_mode: "quick-push-multichannel" },
      segment_ids: [],
      attached_images_ids: [],
      ignore_workflow_quiet_time: false,
      trigger_schedule: {
        start_time: startTime,
        limit_end: false,
        end_time: null,
        deliver_in_local_time: true,
        send_after_quiet_time: false,
        quiet_start_hour: 0,
        quiet_start_minute: "00",
        quiet_end_hour: 8,
        quiet_end_minute: "00",
        trigger_events: [],
        exception_events: [],
        trigger_delay_in_seconds: 0,
        duration_in_seconds: 0,
        reevaluate_segment_at_send_time: true,
        evaluate_segment_at_enqueue_time: false,
        delivery_time_without_zone: null,
        delivery_day: null,
        deliver_in_days: null,
        optimal_time_notification: false,
        delay_option: "immediately",
        retry_window_seconds: 0
      },
      delivery_validation_failure_behavior: "exit",
      using_v2_filters: true,
      filters: null,
      exclusion_filters: null
    },
    {
      step_id: stepId2,
      step_name: "Message",
      next_step_ids: [],
      row: 0,
      column: 3,
      is_control_step: false,
      type: "MESSAGE",
      id_eagerly_created: true,
      push_max_enabled: false,
      banner_priority_bucket: 2,
      banner_priority_for_unpersisted_step: null,
      is_disconnected: false
    }
  ]);

  const variations = JSON.stringify([{
    id: variantId,
    name: "Variant 1",
    send_percentage: 100,
    initial_send_percentage: 100,
    first_step_ids: [],
    first_canvas_step_id: stepId2,
    is_control: false
  }]);

  const schedule = JSON.stringify({
    send_immediately: false,
    recurring: false,
    frequency: "",
    end_date: tomorrow,
    deliver_in_local_time: false,
    end_condition: "never",
    optimal_time_notification: false,
    sunday: false, monday: false, tuesday: false,
    wednesday: false, thursday: false, friday: false, saturday: false,
    start_date_unix: null, end_date_unix: null, next_send_occurence: null
  });

  const fields = {
    workflow_id: `"${workflowId}"`,
    create_version: 'false',
    api_workflow_id: `"${apiWorkflowId}"`,
    workflow_name: `"${(canvasPayload.canvas?.name || canvasPayload.name || 'Copilot Canvas')}"`,
    workflow_description: 'null',
    segment_ids: JSON.stringify(canvasPayload.canvas?.entry_audience?.segment_ids || canvasPayload.segment_ids || []),
    match_more_than_once: 'false',
    can_match_again_after_seconds: '0',
    schedule_type: '"time_based"',
    recipient_subscription_state: '1',
    ignore_global_frequency_capping: 'false',
    exclude_from_global_frequency_count: 'false',
    enabled: 'false',
    is_draft: 'true',
    version: '"flow"',
    tag_names: JSON.stringify(canvasPayload.tag_names || []),
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
    conversion_behaviors: '[]',
    exit_criteria: '{"segment_ids":[],"exit_event":[],"filters_unchanged":true,"using_v2_filters":true}',
    filters_unchanged: 'true',
    using_v2_filters: 'true',
    schedule: schedule,
    steps: steps,
    step_count: '1',
    deletion_move_to_map: '{}',
    variations: variations,
    quiet_time_data: '{"has_quiet_time":false,"send_after_quiet_time":false,"quiet_start_hour":0,"quiet_start_minute":"00","quiet_end_hour":8,"quiet_end_minute":"00"}',
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
    path: `/engagement/canvas?app_group_id=5e8e435643c19d324035c99e`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body),
      'Cookie': `_session_id=${CONFIG.brazeSessionId}`,
      'X-CSRF-Token': CONFIG.brazeCsrfToken,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': `https://${CONFIG.brazeDashboardEndpoint}`,
      'ab-app-group-id': '5e8e435643c19d324035c99e'
    }
  }, body);

  console.log('Braze response status:', result.status);
  console.log('Braze response body:', JSON.stringify(result.body).slice(0, 500));

  return result;
}

// ─── CLAUDE API ───────────────────────────────────────────────────────────────

async function callClaude(messages, systemPrompt) {
  const body = {
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: systemPrompt,
    messages
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
      'Content-Length': Buffer.byteLength(bodyStr)
    }
  }, bodyStr);
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

      const systemPrompt = buildSystemPrompt(workspaceContext || 'Workspace context not loaded.');
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: result.status, response: result.body }));
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
