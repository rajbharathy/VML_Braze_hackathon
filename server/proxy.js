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

// ─── KNOWLEDGE LOADER ─────────────────────────────────────────────────────────

function loadKnowledge() {
  const files = ['best-practice.md', 'client-context.md', 'ecosystem-architecture.md', 'braze-api-reference.md', 'canvas-brief.md', 'canvas-metrics-module.md', 'housekeeping-module.md', 'workspace-health-module.md'];
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

## Canvas JSON output format
When producing a Canvas configuration, always structure your response as follows:
1. First explain your reasoning — why this structure, why these segments, why this timing
2. Show a human-readable summary of the Canvas design
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
- Always use segment UUIDs from the live workspace context — never segment names
- Always include is_legal_drinking_age == true in entry criteria for Campari Group
- schedule_type must be one of: "time_based", "action_based", "api_triggered"
- Always wrap the root in a "canvas" key: { "canvas": { ... } }
- The <canvas_json> block must be the very last thing in your response

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
  const canvas = canvasPayload.canvas || canvasPayload;
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2, 18);
  const workflowId = generateObjectId();
  const apiWorkflowId = generateUUID();
  const changelogId = generateObjectId();
  const startTime = Math.floor(Date.now() / 1000) + 300;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ── Map copilot steps to Braze internal step format ──────────────────────
  const copilotSteps = canvas.steps || [];

  // Build a lookup from copilot step id/name → generated Braze stepId
  const stepIdMap = {};
  copilotSteps.forEach((s, i) => {
    const key = s.id || s.name || `step_${i}`;
    stepIdMap[key] = generateObjectId();
  });

  // Helper to resolve next_step_id to a generated Braze ObjectId
  function resolveNextId(nextStepRef) {
    if (!nextStepRef) return null;
    if (stepIdMap[nextStepRef]) return stepIdMap[nextStepRef];
    // Try matching by name
    const match = copilotSteps.find(s => s.name === nextStepRef || s.id === nextStepRef);
    if (match) {
      const key = match.id || match.name;
      return stepIdMap[key];
    }
    return null;
  }

  // Build Braze steps array from copilot steps
  let brazeSteps = [];
  let firstMessageStepId = null;

  copilotSteps.forEach((step, i) => {
    const key = step.id || step.name || `step_${i}`;
    const stepId = stepIdMap[key];
    const nextId = resolveNextId(step.next_step_id || step.next_step);
    const nextIds = nextId ? [nextId] : [];
    const row = i;
    const col = 3;

    const type = (step.type || '').toLowerCase();

    if (type === 'delay') {
      const durationSecs = (() => {
        const d = step.delay || {};
        const val = d.duration || 0;
        const unit = (d.unit || d.duration_unit || 'minutes').toLowerCase();
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
          limit_end: false,
          end_time: null,
          deliver_in_local_time: true,
          send_after_quiet_time: false,
          quiet_start_hour: 0, quiet_start_minute: '00',
          quiet_end_hour: 8, quiet_end_minute: '00',
          trigger_events: [], exception_events: [],
          trigger_delay_in_seconds: durationSecs,
          duration_in_seconds: durationSecs,
          reevaluate_segment_at_send_time: true,
          evaluate_segment_at_enqueue_time: false,
          delivery_time_without_zone: null,
          delivery_day: null,
          deliver_in_days: null,
          optimal_time_notification: false,
          delay_option: 'delay_for',
          retry_window_seconds: 0
        },
        delivery_validation_failure_behavior: 'exit',
        using_v2_filters: true,
        filters: null,
        exclusion_filters: null
      });

    } else if (type === 'message') {
      if (!firstMessageStepId) firstMessageStepId = stepId;
      const channels = step.channels || step.messages || {};
      const email = channels.email || {};
    const push = channels.push || {};
const pushIos = push.ios || channels.push_ios || {};
const pushAndroid = push.android || channels.push_android || {};

      // Build messaging_actions
      const messagingActions = [];

      if (email.subject || email.body) {
        messagingActions.push({
          type: 'email',
          message: {
            subject: email.subject || '',
            preheader: email.preheader || '',
            from: email.from_address ? `${email.from_name || 'Braze'} <${email.from_address}>` : (email.from || ''),
            reply_to: email.reply_to || '',
            body: email.body || '',
            plaintext_body: email.plaintext_body || '',
            should_inline_css: email.should_inline_css !== false
          }
        });
      }

      if (push.ios || push.android) {
       const ios = pushIos;
const android = pushAndroid;
if (ios.alert || ios.title) {
          messagingActions.push({
            type: 'ios_push',
            message: {
              alert: ios.alert || '',
              title: ios.title || '',
              deep_link: ios.deep_link || '',
              time_to_live: ios.time_to_live || 86400
            }
          });
        }
        if (android.alert || android.title) {
          messagingActions.push({
            type: 'android_push',
            message: {
              alert: android.alert || '',
              title: android.title || '',
              deep_link: android.deep_link || '',
              time_to_live: android.time_to_live || 86400
            }
          });
        }
      }

      brazeSteps.push({
        step_id: stepId,
        step_name: step.name || 'Message',
        next_step_ids: nextIds,
        row, column: col,
        is_control_step: false,
        type: 'MESSAGE',
        id_eagerly_created: true,
        push_max_enabled: false,
        banner_priority_bucket: 2,
        banner_priority_for_unpersisted_step: null,
        is_disconnected: false,
        messages: {
          messaging_actions: messagingActions,
          composition_mode: 'quick-push-multichannel'
        }
      });

    } else if (type === 'action_path' || type === 'audience_path' || type === 'decision_split') {
      // For branching steps — create as a basic FULL step pointing to first path's next step
      const paths = (step.paths || step.action_path_settings?.paths || step.audience_path_settings?.paths || []);
      const firstNextRef = paths[0]?.next_step_id || step.next_step_id;
      const firstNextId = resolveNextId(firstNextRef);

      brazeSteps.push({
        step_id: stepId,
        step_name: step.name || 'Branch',
        next_step_ids: firstNextId ? [firstNextId] : [],
        row, column: col,
        is_control_step: false,
        type: 'FULL',
        id_eagerly_created: true,
        push_max_enabled: false,
        banner_priority_bucket: 2,
        banner_priority_for_unpersisted_step: null,
        ms_id: firstNextId || null,
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
  });

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
      first_canvas_step_id: brazeSteps[0]?.step_id || null,
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
      first_canvas_step_id: brazeSteps[0]?.step_id || null,
      is_control: false
    }];
  }

  // ── Build schedule ────────────────────────────────────────────────────────
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
    start_date_unix: null, end_date_unix: null, next_send_occurence: null
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
    segment_ids: JSON.stringify(canvas.entry_audience?.segment_ids || []),
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

  return result;
}
// ─── CLAUDE API ───────────────────────────────────────────────────────────────

async function callClaude(messages, systemPrompt) {
  const body = {
    model: 'claude-sonnet-4-5',
    max_tokens: 8192,
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
