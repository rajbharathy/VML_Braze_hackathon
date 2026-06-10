# Housekeeping Module Specification
> Technical rules and REST API query structures to validate, clean, and optimize assets within the Braze workspace.

---

## 1. Orphan Segments
* **Action**: Identify segments that exist but are unused, preventing audience target bloat.
* **API Flow**:
1. Fetch all active segments via the Braze dashboard endpoint /engagement/segments?query[0][key]=status&query[0][value]=active&limit=1000&app_group_id={app_group_id}&fields=description,tags,name,marked_as_deleted,last_edited_by,last_edited. Response shape: { hits: N, results: [ { id, name, description, last_edited, last_edited_by } ] }
2. For each segment, query its engagement usage via /engagement/segments/{segment_id}/engagements?app_group_id={app_group_id}. Response shape: { campaigns_using_segment: { count: N }, cards_using_segment: { count: N }, workflows_using_segment: { count: N }, segments_using_segment: { count: N } }
* **Validation Rule**: Flag any segment where all four engagement counts equal 0. Note: draft campaigns are included in the count.
Output: Written to unused_segments.md. Triggered via GET /scrape-segments on the proxy server.

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
* **Action**: Flag custom attributes that are being tracked but are never leveraged for personalization, logic, or audience filtering.
* **API Flow**:
1. Fetch all custom attributes via the Braze dashboard endpoint /app_settings/custom_attributes_data?limit=1000&sortby=name&sortdir=1&start=0&app_group_id={app_group_id}&query[0][key]=blacklisted&query[0][value]=all. Response shape: { hits: N, results: [ { name, detected_data_type, updated_at } ] }
2. For each attribute, query its usage via /app_settings/custom_attributes_values?name={attribute_name}&app_group_id={app_group_id}. Response shape: { breakdown: { value: count }, total_users: N, total: N, total_users_in_app_group: N }
* Validation Rule: Flag any attribute where total === 0, meaning no users in the workspace currently have this attribute set.
* Output: Written to unused_attributes.md. Triggered via GET /scrape-attributes on the proxy server.

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