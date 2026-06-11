# Braze MCP Server — Capability Reference

> Reference list of capabilities exposed by the official Braze MCP Server
> (https://pypi.org/project/braze-mcp-server/, docs at https://www.braze.com/docs/mcp/).
> This project does not run that MCP server — instead, capabilities we want are mirrored
> as direct REST API routes in `server/proxy.js`, using the same
> `Authorization: Bearer {api_key}` pattern as existing routes (see `braze-api-reference.md`).
>
> Endpoint paths marked "not yet implemented" are best-effort based on standard Braze REST
> API conventions — verify against Braze's official API reference before implementing.

---

## Read-only tool categories

### Campaigns
- Campaign list, details, analytics (data series)
- REST: `GET /campaigns/list`, `/campaigns/details`, `/campaigns/data_series`
- Status: implemented (`/campaigns/list`)

### Canvas
- Canvas list, details, analytics (data series)
- REST: `GET /canvas/list`, `/canvas/details`, `/canvas/data_series`
- Status: implemented

### Segments
- Segment list, details, analytics
- REST: `GET /segments/list`, `/segments/details`, `/segments/data_series`
- Status: list/details implemented; data_series not yet

### Custom Attributes
- REST: `GET /custom_attributes`
- Status: implemented

### Custom Events
- Event list, analytics
- REST: `GET /events/list`, `/events/data_series`
- Status: list implemented (housekeeping); data_series not yet

### KPIs
- Daily active users, monthly active users, new users, uninstalls
- REST: `GET /kpi/dau/data_series`, `/kpi/mau/data_series`, `/kpi/new_users/data_series`, `/kpi/uninstalls/data_series`
- Status: not yet implemented

### Catalogs
- Catalog list, item details
- REST: `GET /catalogs`, `/catalogs/{catalog_name}/items`, `/catalogs/{catalog_name}/items/{item_id}`
- Status: not yet implemented

### Content Blocks
- List, details
- REST: `GET /content_blocks/list`, `/content_blocks/info`
- Status: not yet implemented

### Email Templates
- List, details
- REST: `GET /templates/email/list`, `/templates/email/info`
- Status: implemented (housekeeping)

### Preference Centers
- List, details
- REST: `GET /preference_center/v1/list`, `/preference_center/v1/{preference_center_id}`
- Status: not yet implemented

### Purchases
- Product list, revenue series, quantity series
- REST: `GET /purchases/product_list`, `/purchases/revenue_series`, `/purchases/quantity_series`
- Status: not yet implemented

### Sessions
- Session analytics
- REST: `GET /sessions/data_series`
- Status: not yet implemented

### Subscription
- User subscription status, subscription group list
- REST: `GET /subscription/status/get`, `/subscription/user/status`, `/subscription/group/list`
- Status: not yet implemented

### SDK Authentication Keys
- Key management
- REST: `GET /app_group/sdk_authentication/keys`
- Status: not yet implemented

---

## Write-capable tools (not yet considered)
- Media library asset creation
- Email template create/update — `POST /templates/email/create`, `/templates/email/update`
- Content block create/update — `POST /content_blocks/create`, `/content_blocks/update`

---

## Integration approach
For each capability we want, add a new REST route in `server/proxy.js` following the existing
pattern (e.g. `/campaigns/list`), then surface it via `loadWorkspaceContext()`, the relevant
`KNOWLEDGE_MAP` bundle, and/or a new sidebar button as the demo requires.
