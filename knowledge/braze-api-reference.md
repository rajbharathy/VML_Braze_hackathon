# Braze API Reference
> This file gives the copilot precise, accurate Braze API specifications.
> Use this when producing API payloads, Canvas configurations, or any programmatic output.
> Do not guess field names or structures — reference this file first.

---

## Important: Two separate API surfaces

Braze has two distinct API surfaces. The copilot must understand which to use:

### 1. Braze REST API (api_key authenticated)
- Base URL: `https://{rest_endpoint}/`
- Auth: `Authorization: Bearer {api_key}` header
- Used for: reading data, sending messages to existing Canvases/campaigns, user tracking
- **Cannot create or modify Canvas structure**

### 2. Braze Dashboard API (session authenticated)
- Base URL: `https://{dashboard_endpoint}/`
- Auth: `Cookie: _session_id={session_id}` + `X-CSRF-Token: {csrf_token}` headers
- Used for: creating and modifying Canvases, campaigns, templates, segments
- **This is the only way to programmatically create a Canvas**
- Session credentials expire — must be refreshed from DevTools on each demo session

---

## Canvas Create — Dashboard API

### Endpoint
```
POST https://{dashboard_endpoint}/engagement/canvas
```

### Headers
```
Content-Type: application/json
Cookie: _session_id={session_id}
X-CSRF-Token: {csrf_token}
```

### How to get session credentials
1. Open Braze dashboard in Chrome
2. Open DevTools (F12) → Network tab
3. Click anything in the dashboard UI
4. Click any network request → Request Headers
5. Copy `_session_id` value from Cookie header
6. Copy `X-CSRF-Token` header value
7. These expire — refresh on the morning of every demo

### Canvas payload structure

```json
{
  "canvas": {
    "name": "Canvas name",
    "description": "Optional description",
    "schedule_type": "scheduled|action_based|api_triggered",
    "start_time": "2025-06-10T09:00:00Z",
    "end_time": "2025-12-31T23:59:59Z",
    "entry_audience": {
      "segment_ids": ["segment_id_1", "segment_id_2"],
      "filter_group": {
        "filters": [],
        "operator": "AND"
      }
    },
    "send_settings": {
      "conversion_events": [
        {
          "conversion_type": "purchase|custom_event|session_start",
          "conversion_deadline": 72,
          "custom_event_name": "purchase_completed"
        }
      ],
      "quiet_hours_enabled": true,
      "send_in_users_local_time": false,
      "rate_limit": null
    },
    "entry_action": {
      "action_type": "immediate|delay",
      "delay": {
        "delay_type": "duration",
        "duration": {
          "duration": 1,
          "duration_unit": "hours"
        }
      }
    },
    "canvas_entry_properties_schema": [],
    "tags": ["tag.env=prod", "tag.channel=email", "tag.program=winback"],
    "teams": [],
    "variants": [
      {
        "name": "Variant 1",
        "weight": 100
      }
    ],
    "steps": [
      {
        "name": "Step name",
        "type": "message|delay|decision_split|action_path|experiment",
        "delay": {
          "delay_type": "duration",
          "duration": {
            "duration": 1,
            "duration_unit": "hours"
          }
        },
        "next_step": "next_step_name_or_null",
        "messages": {
          "email": {
            "app_id": "your_app_id",
            "subject": "Subject line here",
            "preheader": "Preview text here",
            "from": "Name <email@domain.com>",
            "reply_to": "reply@domain.com",
            "body": "<html><body>Email HTML body here</body></html>",
            "plaintext_body": "Plain text version here",
            "should_inline_css": true,
            "email_template_id": null
          }
        }
      }
    ]
  },
  "last_edit_changelog_id": "changelog_id_from_get_canvas_details"
}
```

### Step types and their structures

#### Message step (email)
```json
{
  "name": "Welcome Email",
  "type": "message",
  "next_step": null,
  "messages": {
    "email": {
      "subject": "Welcome, {{ custom_attribute.${first_name} | default: 'there' }}!",
      "preheader": "Your account is ready",
      "from": "Brand Name <hello@brand.com>",
      "body": "<html><body><p>Hi {{ custom_attribute.${first_name} | default: 'there' }},</p><p>Welcome aboard.</p></body></html>",
      "plaintext_body": "Hi {{ custom_attribute.${first_name} | default: 'there' }}, welcome aboard."
    }
  }
}
```

#### Message step (push)
```json
{
  "name": "Push Notification",
  "type": "message",
  "next_step": null,
  "messages": {
    "push_ios": {
      "alert": "Push message text here — max 60 chars on iOS",
      "title": "Optional title",
      "extras": {},
      "time_to_live": 86400,
      "deep_link": "app://screen/path"
    },
    "push_android": {
      "alert": "Push message text here",
      "title": "Optional title",
      "extras": {},
      "time_to_live": 86400,
      "deep_link": "app://screen/path"
    }
  }
}
```

#### Delay step
```json
{
  "name": "Wait 3 days",
  "type": "delay",
  "next_step": "Next Step Name",
  "delay": {
    "delay_type": "duration",
    "duration": {
      "duration": 3,
      "duration_unit": "days"
    }
  }
}
```

#### Action path step
```json
{
  "name": "Did they open?",
  "type": "action_path",
  "window": {
    "duration": 3,
    "duration_unit": "days"
  },
  "paths": [
    {
      "name": "Opened email",
      "filters": [
        {
          "type": "email_open",
          "campaign_id": null
        }
      ],
      "next_step": "Converted Path Step"
    },
    {
      "name": "Everyone else",
      "filters": [],
      "next_step": "No Open Path Step"
    }
  ]
}
```

#### Decision split step
```json
{
  "name": "Is VIP?",
  "type": "decision_split",
  "filter_group": {
    "filters": [
      {
        "type": "custom_attribute",
        "custom_attribute_name": "loyalty_tier",
        "operator": "equals",
        "value": "platinum"
      }
    ],
    "operator": "AND"
  },
  "true_next_step": "VIP Path Step",
  "false_next_step": "Standard Path Step"
}
```

---

## Canvas Read — REST API

### List Canvases
```
GET /canvas/list?page=0&sort_direction=desc
Authorization: Bearer {api_key}
```

### Get Canvas details
```
GET /canvas/details?canvas_id={canvas_id}
Authorization: Bearer {api_key}
```
Returns: full Canvas config including step IDs, variant structure, `last_edit_changelog_id`

### Get Canvas data series
```
GET /canvas/data_series?canvas_id={canvas_id}&ending_at={ISO_date}&starting_at={ISO_date}&include_variant_breakdown=true
Authorization: Bearer {api_key}
```

---

## Campaign Read — REST API

### List campaigns
```
GET /campaigns/list?page=0&sort_direction=desc
Authorization: Bearer {api_key}
```

### Get campaign details
```
GET /campaigns/details?campaign_id={campaign_id}
Authorization: Bearer {api_key}
```

### Get campaign data series
```
GET /campaigns/data_series?campaign_id={campaign_id}&ending_at={ISO_date}&length=30
Authorization: Bearer {api_key}
```

---

## Segments — REST API

### List segments
```
GET /segments/list?page=0&sort_direction=desc
Authorization: Bearer {api_key}
```

### Get segment details
```
GET /segments/details?segment_id={segment_id}
Authorization: Bearer {api_key}
```

### Get segment data series (audience size over time)
```
GET /segments/data_series?segment_id={segment_id}&ending_at={ISO_date}&length=30
Authorization: Bearer {api_key}
```

---

## Custom Attributes — REST API

### List custom attributes
```
GET /custom_attributes?page=0&num_per_page=100
Authorization: Bearer {api_key}
```

Returns:
```json
{
  "attributes": [
    {
      "name": "loyalty_tier",
      "description": "Customer loyalty programme tier",
      "data_type": "string",
      "status": "Active",
      "tag_names": []
    }
  ]
}
```

---

## Templates — REST API

### List email templates
```
GET /templates/email/list?count=100&offset=0
Authorization: Bearer {api_key}
```

### Get email template info
```
GET /templates/email/info?email_template_id={template_id}
Authorization: Bearer {api_key}
```

---

## Content Blocks — REST API

### List content blocks
```
GET /content_blocks/list?count=100&offset=0
Authorization: Bearer {api_key}
```

### Get content block info
```
GET /content_blocks/info?content_block_id={block_id}
Authorization: Bearer {api_key}
```

---

## Scheduled Broadcasts — REST API

### Get scheduled broadcasts
```
GET /messages/scheduled_broadcasts?end_time={ISO_date}
Authorization: Bearer {api_key}
```

---

## Subscription Groups — REST API

### List subscription groups
```
GET /subscription/user/status?external_id={user_id}
Authorization: Bearer {api_key}
```

---

## User Track — REST API

### Track custom events and attributes
```
POST /users/track
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "attributes": [
    {
      "external_id": "user_123",
      "loyalty_tier": "gold",
      "last_purchase_date": "2025-05-01"
    }
  ],
  "events": [
    {
      "external_id": "user_123",
      "name": "purchase_completed",
      "time": "2025-05-01T10:00:00Z",
      "properties": {
        "order_value": 85.00,
        "product_category": "clothing"
      }
    }
  ]
}
```

---

## Copilot rules for API output

When producing any API payload or endpoint reference, the copilot must:

1. **Always use the correct API surface** — REST API for reads, Dashboard API for Canvas create/modify
2. **Always include auth headers** in example curl commands
3. **Always validate segment IDs exist** before including in Canvas entry_audience
4. **Always include `last_edit_changelog_id`** in Canvas write payloads to avoid concurrency conflicts — get it from `GET /canvas/details` first
5. **Never hardcode user IDs or API keys** in produced payloads — use placeholders
6. **Always note when session credentials are required** and remind the user they expire
7. **Liquid in message bodies** must follow the standards in best-practice.md — all variables with defaults, Connected Content with timeout and error handling
8. **Duration units** accepted values: `minutes`, `hours`, `days`, `weeks`
9. **Schedule types**: `scheduled`, `action_based`, `api_triggered`
10. **Tag format**: always `key=value` e.g. `tag.env=prod` not just `prod`
