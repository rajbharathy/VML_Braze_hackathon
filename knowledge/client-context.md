# Client Context
> Complete this file at the start of every engagement. The copilot uses this to make advice specific to this client rather than generic.
> This file is loaded at session start and remains in context throughout every conversation.

---

## Client Overview

**Client name:** [CLIENT NAME]
**Industry:** [e.g. Retail, QSR, Streaming, Financial Services]
**Primary market(s):** [e.g. UK, US, DACH, Global]
**Braze contract tier:** [e.g. Growth, Prime, Enterprise]
**Engagement type:** [e.g. Implementation, BAU optimisation, Strategic advisory]
**Engagement start date:** [DATE]
**Primary contact:** [NAME, ROLE]

---

## Business Context

### What they sell
[2-3 sentences describing the core product or service, who buys it, and how they buy it]

### Key business objectives this engagement supports
- [OBJECTIVE 1 — e.g. Increase repeat purchase rate among first-time buyers]
- [OBJECTIVE 2 — e.g. Reduce churn in the 30-60 day post-acquisition window]
- [OBJECTIVE 3 — e.g. Drive adoption of the mobile app among web-only users]

### Key metrics they care about
- [METRIC 1 — e.g. Revenue per message sent]
- [METRIC 2 — e.g. 90-day retention rate]
- [METRIC 3 — e.g. App DAU/MAU ratio]

---

## Audience

### Key customer segments (business definition)
| Segment name | Description | Approximate size |
|---|---|---|
| [e.g. VIP] | [e.g. Customers with 3+ purchases in last 90 days] | [e.g. ~15,000] |
| [e.g. Lapsed] | [e.g. No purchase in 60-180 days] | [e.g. ~40,000] |
| [e.g. New] | [e.g. First purchase within last 30 days] | [e.g. ~8,000] |

### Channel opt-in profile
- Email opted-in: [APPROX %]
- Push opted-in (iOS): [APPROX %]
- Push opted-in (Android): [APPROX %]
- SMS opted-in: [APPROX % or N/A]

---

## Data Model

### Key custom attributes
> The copilot will also read these live from the API. Use this section to add business context and descriptions that the API does not provide.

| Attribute name | Type | Description | Example values |
|---|---|---|---|
| [e.g. loyalty_tier] | String | [e.g. Customer's current loyalty programme tier] | [e.g. bronze, silver, gold, platinum] |
| [e.g. last_purchase_date] | Date | [e.g. Date of most recent transaction] | [e.g. 2025-05-01] |
| [e.g. preferred_channel] | String | [e.g. Self-declared preferred contact channel] | [e.g. email, push, sms] |
| [e.g. lifetime_value] | Number | [e.g. Total revenue attributed to this customer] | [e.g. 450.00] |
| [e.g. subscription_plan] | String | [e.g. Active subscription tier] | [e.g. basic, premium, family] |

### Key custom events
| Event name | Description | Key properties |
|---|---|---|
| [e.g. purchase_completed] | [e.g. Fired on order confirmation] | [e.g. order_value, product_category, is_first_purchase] |
| [e.g. app_session_started] | [e.g. Fired on app open] | [e.g. session_source, device_type] |
| [e.g. content_viewed] | [e.g. Fired when user views a content item] | [e.g. content_id, content_type, time_spent_seconds] |

---

## Ecosystem Architecture

### Connected platforms
| Platform | Type | Connection method | What it provides |
|---|---|---|---|
| [e.g. Snowflake] | Data warehouse | [e.g. Braze Currents export] | [e.g. Full event history for audience building] |
| [e.g. Salesforce] | CRM | [e.g. Connected Content API] | [e.g. Account status, contract value] |
| [e.g. Loyalty platform name] | Loyalty | [e.g. Webhook + Connected Content] | [e.g. Points balance, tier status, offer eligibility] |
| [e.g. Product catalogue] | Commerce | [e.g. Braze Catalogs] | [e.g. Product name, price, image URL, stock status] |

### What is technically possible
Based on the connected ecosystem above, the copilot should know:
- [FILL IN: e.g. Real-time loyalty points balance is available via Connected Content at runtime]
- [FILL IN: e.g. Product recommendations are available via the catalogue — up to 5 items per message]
- [FILL IN: e.g. CRM account data is available but has a 15-minute cache — not suitable for real-time triggers]
- [FILL IN: e.g. SMS is not available — client has not procured a sending number]

### What is NOT possible
- [FILL IN: e.g. Transactional email not yet configured — all sends are marketing only]
- [FILL IN: e.g. Web push not available — client app is mobile only]
- [FILL IN: e.g. In-app messages on Android only — iOS SDK not yet deployed]

---

## Constraints and Preferences

### Compliance and legal
- [FILL IN: e.g. GDPR — EU users only, consent required before any marketing send]
- [FILL IN: e.g. Suppression list of 12,000 users must be applied to all sends]
- [FILL IN: e.g. Financial promotions must be approved by compliance team before scheduling]

### Brand and tone
- [FILL IN: e.g. Tone of voice: warm, conversational, never formal. No exclamation marks.]
- [FILL IN: e.g. Brand name: always "ClientName" — never abbreviated]
- [FILL IN: e.g. Emoji: permitted in push and in-app only, not in email subject lines]

### Client preferences and sensitivities
- [FILL IN: e.g. Client is sensitive about send frequency — agreed cap of 2 emails per week per user]
- [FILL IN: e.g. Client has a strong preference for A/B testing before any large-scale rollout]
- [FILL IN: e.g. Stakeholder sign-off required before any Canvas targeting more than 50,000 users]

---

## Current Programme State

### Active Canvases (high level)
[Brief summary of what is currently live — the copilot will read the full list via API]

### Known issues or priorities
- [FILL IN: e.g. Welcome Canvas has not been updated in 6 months — needs review]
- [FILL IN: e.g. Lapsed re-engagement Canvas has low conversion — investigate step 3 drop-off]
- [FILL IN: e.g. No post-purchase Canvas exists — identified as a priority gap]

### Upcoming campaigns
- [FILL IN: e.g. Summer sale campaign planned for July — brief not yet received]
- [FILL IN: e.g. Loyalty tier update comms required by end of Q2]
