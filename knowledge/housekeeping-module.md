# Housekeeping Module Specification
> Technical rules and REST API query structures to validate, clean, and optimize assets within the Braze workspace.

---

## 1. Orphan Segments
* **Action:** Identify segments that exist but are unused, preventing audience target bloat.
* **API Flow:**
1. Fetch all segments via `/segments/list`.
2. Fetch all active campaigns (`/campaigns/list`) and active canvases (`/canvas/list`).
3. Parse campaign and canvas setup data (including target segments and entry audience rules).
* **Validation Rule:** Flag any segment where `active_references == 0`.

---

## 2. Unused Custom Events
* **Action:** Audit custom events to clean up the data taxonomy.
* **API Flow:**
1. Fetch the complete event list from the track settings page or data model API.
2. Scan all active canvases and campaigns.
3. Search for references to the event name as:
   * An Entry Trigger
   * An Action Path step event
   * A Conversion Event
   * A Segment Filter criteria
* **Validation Rule:** Flag custom events that are currently defined in the taxonomy but have `0 active references`.

---

## 3. Unused Custom Attributes
* **Action:** Flag custom attributes that are being tracked but are never leveraged for personalization, logic, or audience filtering.
* **API Flow:**
1. Query active schema / custom attributes.
2. Perform a code-level string scan across:
   * Message templates (searching for Liquid references like `{{custom_attribute.${attribute_name}}}`)
   * Canvas branching steps (Audience Splits, Decision Splits)
   * Segment definitions
* **Validation Rule:** Flag attributes that return `0 references` in active assets.

---

## 4. Naming Convention Breaks
* **Action:** Enforce naming hygiene to keep workspaces searchable.
* **API Flow:** Query names of all active/draft segments, campaigns, canvases, custom events, and attributes.
* **Pattern Definition:** Match against the established firm regex:
`^(?<date>\d{8})_(?<client>[A-Z0-9]+)_(?<program>[A-Z0-9]+)_(?<type>[A-Z0-9]+)_(?<channel>[A-Z_]+)_(?<locale>[A-Z]{2})_v(?<version>\d+)$`
*(Example: `20260609_CLIENTNAME_WELCOME_CANVAS_EMAIL_PUSH_US_v1`)*
* **Validation Rule:** Flag any asset whose name fails to match the regular expression.

---

## 5. Dead/Stale Campaigns
* **Action:** Flag campaigns that are active but no longer sending messages.
* **API Flow:**
1. Query `/campaigns/list` with status `Active`.
2. Extract the `last_sent` timestamp.
* **Validation Rule:** Flag campaigns where `last_sent` is `> 90 days` ago.

---

## 6. Stale Draft Campaigns
* **Action:** Keep drafts clear of redundant, abandoned testing concepts.
* **API Flow:**
1. Query `/campaigns/list` filtered by `status = "Draft"`.
2. Extract the `created_at` timestamp.
* **Validation Rule:** Flag draft campaigns created `> 30 days` ago that have never transitioned to active or scheduled status.

---

## 7. Zero-Member Segments
* **Action:** Clean up segments that target non-existent cohorts.
* **API Flow:**
1. Query `/segments/list`.
2. For each segment, query `/segments/details` to fetch the current member count.
* **Validation Rule:** Flag any segment where `member_count == 0`.

---

## 8. Unused Email Templates
* **Action:** Prevent design bloat and stale branding across templates.
* **API Flow:**
1. Query `/templates/email/info` to fetch all available email templates.
2. Scan every step of active campaigns and canvases.
* **Validation Rule:** Flag templates where the `template_id` is referenced `0 times` in currently active campaign or canvas steps.