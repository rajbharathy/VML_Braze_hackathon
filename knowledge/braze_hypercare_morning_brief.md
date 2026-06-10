<!--
  ╔══════════════════════════════════════════════════════════════════════════╗
  ║          BRAZE HYPERCARE & MORNING BRIEF — MASTER TEMPLATE              ║
  ║          Version 2.0 | Built for Braze Hackathon 2025                   ║
  ║          Covers: Forge 2025 features · BrazeAI · All channels           ║
  ╚══════════════════════════════════════════════════════════════════════════╝
-->

# 🟠 Braze Hypercare & Morning Brief

> **A complete daily operating system for Braze teams — from CRM operators to engineers to leadership.**
> Covers campaign health, data integrity, deliverability, BrazeAI, compliance, and everything in between.

---

## 📋 Brief Header

| Field | Value |
|---|---|
| **Date** | YYYY-MM-DD |
| **Prepared by** | Name / Role |
| **Braze workspace** | Workspace name |
| **Environment** | Production / Staging |
| **Timezone** | EST / PST / GMT / local |
| **Review window** | Last 24 hours / since last brief |
| **Brief generated at** | HH:MM |
| **Overall status** | 🟢 Green / 🟡 Watch / 🔴 Action Required |

---

## 🧭 Section 0 — Executive Summary

> **Read this first. Write this last. This is what leadership sees.**

### Instance Health at a Glance

| Area | Status | Summary | Owner | Action Needed |
|---|---|---|---|---|
| System / Platform | 🟢 / 🟡 / 🔴 | | | |
| Campaigns & Canvases | 🟢 / 🟡 / 🔴 | | | |
| Data Ingestion & Events | 🟢 / 🟡 / 🔴 | | | |
| Email Deliverability | 🟢 / 🟡 / 🔴 | | | |
| Push / SMS / WhatsApp / RCS | 🟢 / 🟡 / 🔴 | | | |
| Personalization & Liquid | 🟢 / 🟡 / 🔴 | | | |
| BrazeAI Features | 🟢 / 🟡 / 🔴 | | | |
| Promo Codes & Catalogs | 🟢 / 🟡 / 🔴 | | | |
| Compliance & Privacy | 🟢 / 🟡 / 🔴 | | | |
| Known Incidents | 🟢 / 🟡 / 🔴 | | | |

### Top 3 Things Leadership Needs to Know Today

1. 
2. 
3. 

### Braze Instance Health Score *(optional but powerful)*

| Category | Weight | Score /10 | Weighted |
|---|---|---|---|
| Campaign & Canvas health | 20% | | |
| Data ingestion & event integrity | 20% | | |
| Email deliverability | 20% | | |
| Personalization & Liquid | 15% | | |
| Revenue & conversion tracking | 15% | | |
| Incidents & open issues | 10% | | |
| **Total** | **100%** | | **/100** |

> 90–100 = 🟢 Green · 75–89 = 🟡 Watch · 60–74 = 🟠 Risk · Below 60 = 🔴 Action Required

---

## 🛠️ Section 1 — System & Platform Health

> Check this before trusting any data in the sections below.

| Check | Status | Notes |
|---|---|---|
| Braze Status Page (status.braze.com) | 🟢 / 🟡 / 🔴 | |
| API availability (last 24 hr) | 🟢 / 🟡 / 🔴 | |
| Dashboard loading normally | 🟢 / 🟡 / 🔴 | |
| SDK data ingestion lag | 🟢 / 🟡 / 🔴 | |
| REST API ingestion lag | 🟢 / 🟡 / 🔴 | |
| Currents export running | 🟢 / 🟡 / 🔴 | |
| Connected Content endpoints responsive | 🟢 / 🟡 / 🔴 | |
| Webhooks firing correctly | 🟢 / 🟡 / 🔴 | |
| Zero-copy Canvas Triggers active *(Forge 2025)* | 🟢 / 🟡 / 🔴 | |
| Cloud Data Ingestion sync healthy | 🟢 / 🟡 / 🔴 | |

**Notes:**
```
[Any anomalies, incidents, or Braze support tickets open]
```

---

## 🔄 Section 2 — What Changed Since Yesterday?

> This section prevents the most common cause of morning incidents: undocumented changes.

### Launches & Updates

| Item | Type | Environment | Change Summary | Expected Impact | Owner | Status |
|---|---|---|---|---|---|---|
| | Canvas / Campaign / Segment / Catalog / API | Dev / Stage / Prod | | | | Live / Paused / Rolled back |

### Configuration Changes Checklist

Review if any of the following changed in the last 24 hours:

- [ ] New or edited canvases
- [ ] New or edited campaigns
- [ ] Segment logic or audience filter changes
- [ ] Frequency cap or rate limit changes
- [ ] Subscription group changes
- [ ] Catalog updates (product catalog, promo codes)
- [ ] Content Block edits
- [ ] Connected Content URL or payload changes
- [ ] Webhook endpoint or auth credential changes
- [ ] Global link template changes
- [ ] UTM / tracking parameter changes
- [ ] IP pool or sending domain changes
- [ ] BrazeAI model assignments changed (Decisioning Studio, Intelligent Timing)
- [ ] Zero-copy Canvas Trigger configurations updated
- [ ] WhatsApp Commerce / Flows / Carousels modified *(Forge 2025)*
- [ ] RCS Rich Card templates updated *(Forge 2025)*
- [ ] Drag & Drop Form Blocks published *(Forge 2025)*

### 🚨 Red Flag Changes — Verify These Immediately

If any of these changed recently, treat as high priority:

- Trigger event name or event property
- Audience entry filters or re-entry eligibility
- Decision split or Audience Path logic
- Liquid personalization or abort logic
- Catalog lookup keys or promotion code pool
- Quiet hours, rate limits, or global frequency caps
- Webhook endpoint, API credentials, or auth tokens
- Sending domain, From name, or Reply-to address
- Conversion event mapping

---

## 📣 Section 3 — Campaign & Canvas Health

### Active Canvas Monitor

| Canvas Name | Status | Entries (24hr) | Sends | Conversions | Revenue | Errors | Last Modified |
|---|---|---|---|---|---|---|---|
| | Live / Paused / Draft | | | | | | |

### Campaign Monitor

| Campaign | Channel | Sends | Open Rate | CTR | Conversions | Bounce | Unsub | Complaints |
|---|---|---|---|---|---|---|---|---|
| | Email / Push / SMS / IAM / Webhook | | | | | | | |

### Entry & Eligibility Checks

- [ ] Are users entering canvases at expected volume?
- [ ] Any canvas sitting at zero entries unexpectedly?
- [ ] Re-entry rules blocking users they shouldn't?
- [ ] Users stuck before a delay step or decision split?
- [ ] Users over-entering due to duplicate event fires?
- [ ] Suppression or frequency caps excluding more than expected?
- [ ] Quiet hours delaying urgent messages?
- [ ] Exit criteria triggering too early or not at all?

### Journey Logic Checks

- [ ] Trigger event firing correctly
- [ ] Entry audience still valid and not empty
- [ ] Conversion events correctly mapped
- [ ] Control groups configured as intended
- [ ] A/B / multivariate splits balanced
- [ ] Winning path rules active only where expected
- [ ] Audience paths not overlapping unexpectedly
- [ ] Delay steps aligned with business requirements
- [ ] Intelligent Timing not suppressing time-sensitive sends
- [ ] Message prioritization rules applied correctly *(Forge 2025)*

---

## 📡 Section 4 — Data Ingestion & Event Health

### Critical Events Monitor

| Event Name | Expected Volume | Actual Volume | Variance % | Status | Notes |
|---|---|---|---|---|---|
| `ecommerce.order_placed` | | | | 🟢 / 🟡 / 🔴 | |
| `ecommerce.checkout_started` | | | | 🟢 / 🟡 / 🔴 | |
| `ecommerce.cart_updated` | | | | 🟢 / 🟡 / 🔴 | |
| `ecommerce.product_viewed` | | | | 🟢 / 🟡 / 🔴 | |
| `back_in_stock_trigger` | | | | 🟢 / 🟡 / 🔴 | |
| `refill_due` | | | | 🟢 / 🟡 / 🔴 | |
| `subscription_started` | | | | 🟢 / 🟡 / 🔴 | |
| `subscription_cancelled` | | | | 🟢 / 🟡 / 🔴 | |
| `confirmed_shipment` | | | | 🟢 / 🟡 / 🔴 | |
| `app_session_start` | | | | 🟢 / 🟡 / 🔴 | |
| [Custom event 1] | | | | 🟢 / 🟡 / 🔴 | |
| [Custom event 2] | | | | 🟢 / 🟡 / 🔴 | |

> ⚠️ Flag immediately if any event drops 30%+ vs. 7-day average.

### Event Payload QA

For any key event, verify:

- [ ] Event name unchanged and correctly cased
- [ ] `external_id` or `braze_id` present and valid
- [ ] Timestamp in valid ISO 8601 format
- [ ] Required event properties present and non-null
- [ ] Product array populated (for commerce events)
- [ ] Price, quantity, currency, SKU/product IDs valid
- [ ] Payload size within Braze limits (max 50KB per event)
- [ ] No unexpected schema changes since last deploy
- [ ] Nested objects and arrays structured as expected
- [ ] eCommerce attributes flowing correctly *(Forge 2025)*
- [ ] Zero-copy trigger payloads matching expected schema *(Forge 2025)*

### Data Freshness

| Source | Last Successful Sync | Expected Cadence | Status | Notes |
|---|---|---|---|---|
| Shopify / ecommerce source | | Real-time / hourly | 🟢 / 🟡 / 🔴 | |
| Data warehouse (Snowflake / BigQuery / Redshift) | | | 🟢 / 🟡 / 🔴 | |
| Product catalog feed | | Daily / hourly | 🟢 / 🟡 / 🔴 | |
| User attribute batch feed | | Daily / real-time | 🟢 / 🟡 / 🔴 | |
| Promotion code files | | As needed | 🟢 / 🟡 / 🔴 | |
| Currents export | | Continuous | 🟢 / 🟡 / 🔴 | |
| CDI (Cloud Data Ingestion) | | | 🟢 / 🟡 / 🔴 | |

---

## 👤 Section 5 — User Profile Health

### Profile Integrity Checks

- [ ] New users creating at expected volume
- [ ] Existing users updating, not duplicating
- [ ] `external_id` consistent across systems
- [ ] Anonymous / alias IDs merging correctly
- [ ] Email addresses present on expected profiles
- [ ] Push tokens present and valid on expected profiles
- [ ] Phone numbers in E.164 format for SMS / WhatsApp
- [ ] Subscription status updating correctly across all channels
- [ ] Loyalty, tier, and affinity attributes current
- [ ] Promo code attributes (`promo_code_issued`, `promo_code_redeemed`, `promo_code_expiry`) not overwritten
- [ ] Test user profiles not polluting production reports
- [ ] No orphaned profiles with no identifier

### Segment Size Monitor

| Segment Name | Today | Yesterday | Delta | Flag if > ±20% |
|---|---|---|---|---|
| | | | | 🟢 / ⚠️ |

### Sample User QA

| User Type | Test Profile ID | Expected Behavior | Actual Behavior | Status |
|---|---|---|---|---|
| New subscriber | | | | 🟢 / 🟡 / 🔴 |
| Abandoned cart user | | | | 🟢 / 🟡 / 🔴 |
| First-time purchaser | | | | 🟢 / 🟡 / 🔴 |
| Loyalty / VIP user | | | | 🟢 / 🟡 / 🔴 |
| Unsubscribed user | | | | 🟢 / 🟡 / 🔴 |
| Re-engagement target | | | | 🟢 / 🟡 / 🔴 |
| Edge case / unusual profile | | | | 🟢 / 🟡 / 🔴 |

---

## 📧 Section 6 — Email Deliverability Health

### Core Metrics

| Metric | Yesterday | 7-Day Avg | Threshold | Status |
|---|---|---|---|---|
| Sends | | | — | 🟢 / 🟡 / 🔴 |
| Delivery Rate | | | > 98% | 🟢 / 🟡 / 🔴 |
| Hard Bounce Rate | | | < 0.5% | 🟢 / 🟡 / 🔴 |
| Soft Bounce Rate | | | < 2% | 🟢 / 🟡 / 🔴 |
| Spam Complaint Rate | | | < 0.08% | 🟢 / 🟡 / 🔴 |
| Unsubscribe Rate | | | < 0.2% | 🟢 / 🟡 / 🔴 |
| Open Rate | | | | 🟢 / 🟡 / 🔴 |
| Click Rate | | | | 🟢 / 🟡 / 🔴 |
| Click-to-Open Rate | | | | 🟢 / 🟡 / 🔴 |

### Domain-Level Monitoring

| Mailbox Provider | Delivery Rate | Bounce Rate | Complaint Rate | Open Rate | Status |
|---|---|---|---|---|---|
| Gmail | | | | | 🟢 / 🟡 / 🔴 |
| Outlook / Hotmail | | | | | 🟢 / 🟡 / 🔴 |
| Yahoo / AOL | | | | | 🟢 / 🟡 / 🔴 |
| Apple Mail / iCloud | | | | | 🟢 / 🟡 / 🔴 |
| Corporate domains | | | | | 🟢 / 🟡 / 🔴 |

### Deliverability Checks

- [ ] Any bounce spike in last 24 hours?
- [ ] Any spam complaint spike?
- [ ] DMARC, SPF, DKIM all passing?
- [ ] Sender alignment issues?
- [ ] Any campaigns accidentally targeting cold / inactive users?
- [ ] Any subject lines or content likely triggering spam filters?
- [ ] Any broken links or blocked tracking pixels?
- [ ] Email Onboarding Enhancements ramping correctly? *(Forge 2025)*

---

## 🔥 Section 7 — IP Warming Status *(Active warming periods only)*

> Skip if not in a warming window. If active — this is non-negotiable daily.

**Warming Day:** Day __ of __ | **Warmup Plan:** [Link] | **Target Volume Today:** ___

| Mailbox Provider | Daily Volume Cap | Actual Sent | Bounce Rate | Spam Rate | Status |
|---|---|---|---|---|---|
| Gmail | | | | | 🟢 / 🟡 / 🔴 |
| Outlook / Hotmail | | | | | 🟢 / 🟡 / 🔴 |
| Yahoo | | | | | 🟢 / 🟡 / 🔴 |
| Apple / iCloud | | | | | 🟢 / 🟡 / 🔴 |
| Other | | | | | 🟢 / 🟡 / 🔴 |

**Reputation Signals:**

| Tool | Score / Status | Notes |
|---|---|---|
| Google Postmaster Tools | | |
| Microsoft SNDS | | |
| 250ok / Validity | | |
| Blacklist check | | |

> 🛑 **Pause warming immediately if:** Spam rate > 0.10% (Gmail threshold) · Hard bounce > 2% · Any major ISP blocking detected

---

## 📲 Section 8 — Channel-Specific Health

### Push (iOS & Android)

| Check | iOS | Android |
|---|---|---|
| Tokens being collected | 🟢 / 🟡 / 🔴 | 🟢 / 🟡 / 🔴 |
| Send success rate | | |
| APNs / FCM errors | | |
| Deep links working | 🟢 / 🟡 / 🔴 | 🟢 / 🟡 / 🔴 |
| Rich push images loading | 🟢 / 🟡 / 🔴 | 🟢 / 🟡 / 🔴 |
| Push TTL / expiry appropriate | 🟢 / 🟡 / 🔴 | 🟢 / 🟡 / 🔴 |
| Permission opt-in rate | | |

### SMS

- [ ] Correct subscription group attached
- [ ] Opt-outs honoured and processed
- [ ] Quiet hours respected
- [ ] Link tracking working
- [ ] Message length and segment count acceptable
- [ ] Compliance language present (STOP instructions, brand name)
- [ ] Phone numbers in E.164 format

### WhatsApp *(Forge 2025 — major update)*

- [ ] WhatsApp Commerce catalog syncing with Meta Catalog correctly
- [ ] WhatsApp Flows (interactive forms) rendering and submitting
- [ ] WhatsApp Carousels loading images and CTAs
- [ ] Template messages approved and active
- [ ] Opt-in / opt-out compliance maintained
- [ ] 24-hour messaging window respected for non-template sends
- [ ] Commerce conversion events tracking back to Braze

### RCS for Business *(Forge 2025)*

- [ ] RCS Rich Cards rendering correctly (media, text, tappable actions)
- [ ] Fallback to SMS for non-RCS-enabled devices configured
- [ ] Branding assets (logo, colour) loading in RCS messages

### In-App Messages & Content Cards

- [ ] Trigger rules working as configured
- [ ] Display frequency not over-capping
- [ ] Users not seeing stale or expired messages
- [ ] CTAs and close buttons working
- [ ] Personalization rendering safely
- [ ] Drag & Drop Form Blocks submitting correctly *(Forge 2025)*
- [ ] Mobile layout rendering acceptably on key device sizes

### Webhooks

- [ ] Endpoint reachable and returning 2xx
- [ ] Auth credentials valid and not expired
- [ ] Payload accepted by downstream system
- [ ] Retry behaviour understood and configured
- [ ] Error rate not increasing vs. baseline
- [ ] Downstream system confirms receipt

---

## 🧪 Section 9 — Personalization, Liquid & Dynamic Content

### Liquid Safety Checklist

- [ ] No broken Liquid syntax in live templates
- [ ] All variables have default / fallback values (`| default: ""`)
- [ ] Null values handled safely
- [ ] Arrays iterated correctly with `for` loops
- [ ] Date / time formatting correct for user timezone
- [ ] Currency formatting correct for user locale
- [ ] Product image fallback present
- [ ] Catalog lookup fallback present
- [ ] Connected Content timeout fallback configured
- [ ] Abort logic intentional and monitored (`{% abort_message %}`)
- [ ] Dynamic URLs correctly encoded
- [ ] Link tracking aliases rendering correctly
- [ ] Promo code attribute rendering: `{{ custom_attribute.${promo_code_issued} }}`

### Connected Content Health

| Endpoint | Used In | Last Response Code | Avg Latency | Cache TTL | Status |
|---|---|---|---|---|---|
| Inventory API | Back-in-Stock Canvas | | ms | | 🟢 / 🟡 / 🔴 |
| Product Catalog API | Refill Reminder | | ms | | 🟢 / 🟡 / 🔴 |
| Recommendation Engine | Cross-sell Email | | ms | | 🟢 / 🟡 / 🔴 |
| Loyalty API | VIP Canvas | | ms | | 🟢 / 🟡 / 🔴 |
| [Custom endpoint] | | | ms | | 🟢 / 🟡 / 🔴 |

### Dynamic Content QA

- [ ] Personalisation renders correctly in test sends
- [ ] No raw `{{` appearing in sent messages
- [ ] Product blocks in emails loading images *(Drag & Drop Email Product Blocks — Forge 2025)*
- [ ] Catalog-driven product content current and not stale

---

## 🎟️ Section 10 — Promotion Codes Health

> This section directly prevents revenue loss and broken customer experiences.

| Code List Name | Total Codes | Remaining | Issued Today | Redeemed Today | Expiring in 48hr | Status |
|---|---|---|---|---|---|---|
| | | | | | | 🟢 / 🟡 / 🔴 |

### Promo Code Integrity Checks

- [ ] Any code list falling below 20% remaining? *(restock now)*
- [ ] Same code issued to only one user? *(deduplication verified)*
- [ ] `promo_code_issued` custom attribute writing correctly to user profile
- [ ] `promo_code_redeemed` attribute updating via webhook / n8n on redemption
- [ ] `promo_code_expiry` attribute driving reminder logic correctly
- [ ] Expired codes no longer appearing in live templates
- [ ] Reminder Canvas filtering on `promo_code_redeemed = false` correctly
- [ ] Cleanup job removing expired code attributes from profiles

### Code Attribute Schema Reference

| Attribute | Type | Expected Value |
|---|---|---|
| `promo_code_issued` | String | e.g. `RESTOCK-VIP-01` |
| `promo_code_expiry` | Date | ISO 8601 format |
| `promo_code_redeemed` | Boolean | `true` / `false` |
| `promo_code_list` | String | Which list it came from |

---

## 🤖 Section 11 — BrazeAI™ Feature Health *(Forge 2025)*

> BrazeAI is now a core part of the platform. Monitor these daily — AI drift is a real operational risk.

### BrazeAI Decisioning Studio™ *(GA — Forge 2025)*

| Check | Status | Notes |
|---|---|---|
| Reinforcement learning model active | 🟢 / 🟡 / 🔴 | |
| Optimising for correct KPI (LTV / revenue / retention) | 🟢 / 🟡 / 🔴 | |
| Personalization dimensions active (channel, content, timing, frequency) | 🟢 / 🟡 / 🔴 | |
| Model training data refreshed | 🟢 / 🟡 / 🔴 | |
| No unexpected channel suppression | 🟢 / 🟡 / 🔴 | |
| Rewards / penalties configured correctly | 🟢 / 🟡 / 🔴 | |

### BrazeAI Agent Console™ *(Beta — Forge 2025)*

| Check | Status | Notes |
|---|---|---|
| Custom agents deployed and running | 🟢 / 🟡 / 🔴 | |
| Agent workflows completing without errors | 🟢 / 🟡 / 🔴 | |
| Agent-generated content variants reviewed before go-live | 🟢 / 🟡 / 🔴 | |
| Localization agents producing accurate output | 🟢 / 🟡 / 🔴 | |

### BrazeAI Operator™ *(Beta — Forge 2025)*

| Check | Status | Notes |
|---|---|---|
| Prompt-generated campaigns reviewed by human before launch | 🟢 / 🟡 / 🔴 | |
| AI-generated segment logic validated | 🟢 / 🟡 / 🔴 | |
| QA tasks completed via Operator reviewed for accuracy | 🟢 / 🟡 / 🔴 | |

### BrazeAI Content Optimizer Agent™ *(Beta — Forge 2025)*

| Check | Status | Notes |
|---|---|---|
| Subject line optimisation active on correct campaigns | 🟢 / 🟡 / 🔴 | |
| Optimised variants not overriding manually approved content | 🟢 / 🟡 / 🔴 | |

### Other BrazeAI Features

| Feature | Active On | Status | Last Reviewed |
|---|---|---|---|
| Intelligent Timing | | 🟢 / 🟡 / 🔴 | |
| Intelligent Channel | | 🟢 / 🟡 / 🔴 | |
| Intelligent Selection (A/B) | | 🟢 / 🟡 / 🔴 | |
| Predictive Churn — model freshness | | 🟢 / 🟡 / 🔴 | |
| Predictive Events — model freshness | | 🟢 / 🟡 / 🔴 | |
| AI Copywriting Assistant | | 🟢 / 🟡 / 🔴 | |

---

## 🔬 Section 12 — A/B Tests & Experiments

| Test Name | Canvas / Campaign | Variant A | Variant B | Sample Size | Days Running | Significance Reached | Action |
|---|---|---|---|---|---|---|---|
| | | | | | | Yes / No | Pick winner / Continue / Extend |

### Experiment Health Checks

- [ ] Any test that reached statistical significance? *(declare winner today)*
- [ ] Any test running past its planned end date?
- [ ] Losing variants still sending at significant volume?
- [ ] Multivariate test sample sizes still balanced?
- [ ] Control groups correctly sized and excluded from other campaigns?
- [ ] BrazeAI Decisioning Studio running in parallel with any manual A/B? *(resolve overlap)*

---

## 📅 Section 13 — Today's Planned Sends

| Campaign / Canvas | Type | Scheduled Time | Audience Size | Channel(s) | Reviewed | Test Send | Approved |
|---|---|---|---|---|---|---|---|
| | | | | | Yes / No | Yes / No | Yes / No |

### Pre-Launch Checklist *(run for every send)*

**Audience**
- [ ] Correct segment / audience attached
- [ ] Audience size reviewed and expected
- [ ] Suppression lists applied (global unsubscribes, internal users, QA profiles)
- [ ] Frequency caps not blocking key users

**Content**
- [ ] Liquid variables all resolve correctly in test send
- [ ] No raw `{{` showing in preview
- [ ] From name and reply-to address correct
- [ ] Subject line and preview text set
- [ ] All links tracked and working
- [ ] UTM parameters applied consistently
- [ ] Images loading and correctly sized
- [ ] Promo codes assigned and pulling correctly
- [ ] Catalog / product blocks loading *(if using Drag & Drop Product Blocks)*

**Technical**
- [ ] Send time correct (fixed time vs. Intelligent Timing)
- [ ] Timezone handling correct
- [ ] Canvas entry controls set (re-entry window, max sends per user)
- [ ] Conversion event correctly mapped
- [ ] Test send reviewed and signed off by a second person

**Rollback Plan**
- [ ] Pause plan documented: who can pause, how fast?
- [ ] Escalation path identified if issues appear in first 30 minutes

---

## 🔗 Section 14 — Automation & Integration Health *(n8n / middleware)*

> For teams using n8n or similar tools to extend Braze.

| Workflow | Last Run | Run Status | Error Count | Slack Alert Firing | Notes |
|---|---|---|---|---|---|
| Back-in-Stock Trigger | | ✅ / ❌ | | Yes / No | |
| Promo Code Issuer | | ✅ / ❌ | | Yes / No | |
| Promo Code Redeemed Updater | | ✅ / ❌ | | Yes / No | |
| Refill Date Calculator | | ✅ / ❌ | | Yes / No | |
| Expired Code Cleanup | | ✅ / ❌ | | Yes / No | |
| User Profile Enrichment | | ✅ / ❌ | | Yes / No | |
| Inventory Polling Job | | ✅ / ❌ | | Yes / No | |
| Segment Sync | | ✅ / ❌ | | Yes / No | |

### Integration Health Checks

- [ ] n8n workflows not failing silently (error alerts confirmed working)
- [ ] Braze API rate limits not being hit (429s in logs?)
- [ ] Webhook payloads from n8n matching Braze expected schema
- [ ] Retry logic configured for transient failures
- [ ] Auth tokens / API keys not expired

---

## 🔐 Section 15 — Compliance & Data Privacy

> Non-negotiable. Especially critical in Canada (CASL), EU (GDPR), and US (CAN-SPAM).

### Daily Compliance Checks

- [ ] Any data deletion (right to erasure) requests received? *(process within SLA)*
- [ ] Any opt-out requests not yet honoured?
- [ ] Any unsubscribes processing correctly across all channels?
- [ ] Any segments accidentally including suppressed or opted-out users?
- [ ] Data retention jobs ran as scheduled overnight?
- [ ] Any PII visible in message logs, event properties, or exports that shouldn't be?
- [ ] Test profiles using real user data? *(should use synthetic data only)*
- [ ] WhatsApp opt-in compliance maintained *(explicit consent required)*
- [ ] SMS compliance language present on all applicable sends

### Subscription State Summary

| Channel | Subscribed | Unsubscribed | Delta vs Yesterday | Flag |
|---|---|---|---|---|
| Email | | | | 🟢 / ⚠️ |
| Push (iOS) | | | | 🟢 / ⚠️ |
| Push (Android) | | | | 🟢 / ⚠️ |
| SMS | | | | 🟢 / ⚠️ |
| WhatsApp | | | | 🟢 / ⚠️ |

---

## 🧹 Section 16 — Workspace Hygiene

> A clean workspace = fewer errors, faster debugging, better team collaboration.

### Weekly Hygiene Tasks *(check off on Mondays)*

- [ ] Archive completed campaigns from last 30 days
- [ ] Delete test / draft canvases older than 30 days
- [ ] Review unused segments and archive if safe
- [ ] Review custom events with no activity in 60+ days
- [ ] Confirm no duplicate custom attributes created
- [ ] Review API key permissions — any keys with broader access than needed?
- [ ] Audit Content Blocks for stale versions
- [ ] Confirm no test content or internal-only links are live in production
- [ ] Review catalog for stale or outdated product entries

---

## 🚨 Section 17 — Anomaly Radar

> Use these thresholds as automatic escalation triggers.

| Signal | Threshold | Actual | Status |
|---|---|---|---|
| Event volume drop | > 30% vs 7-day avg | | 🟢 / 🔴 |
| Canvas entries drop | > 30% vs 7-day avg | | 🟢 / 🔴 |
| Email hard bounce spike | > 0.5% | | 🟢 / 🔴 |
| Spam complaint spike | > 0.08% | | 🟢 / 🔴 |
| Unsubscribe spike | > 0.2% | | 🟢 / 🔴 |
| Webhook error rate increase | > 10% of calls | | 🟢 / 🔴 |
| Segment size change | > ±20% overnight | | 🟢 / 🔴 |
| Promo code list < 20% remaining | | | 🟢 / 🔴 |
| Conversion rate drop | > 20% vs 7-day avg | | 🟢 / 🔴 |
| API rate limit hit (429s) | Any | | 🟢 / 🔴 |

### "What Broke Overnight?" Questions

Answer these every morning before anything else:

1. Which canvas had the biggest volume drop vs. yesterday?
2. Which canvas had the biggest error increase?
3. Which email had the biggest click or open rate drop?
4. Which event had the biggest payload change or volume anomaly?
5. Which audience segment changed the most in size?
6. Which product or category drove abnormal activity?

---

## 💬 Section 18 — BrazeAI Prompt Toolkit

> Copy-paste prompts for instant AI analysis during hypercare.

### Morning Triage Prompt

```
Act as a Braze hypercare analyst. Review the following campaign, canvas, event, 
deliverability, catalog, and incident data. Create a morning brief with:
1) executive summary
2) health status by area
3) anomalies vs. baseline
4) likely root causes
5) recommended actions
6) owners and deadlines
7) risks if no action is taken

Keep it practical for a CRM operator. Data: [paste metrics here]
```

### Root Cause Prompt

```
You are troubleshooting a Braze issue. Based on the symptoms below, list:
- Most likely causes in priority order
- Evidence to check inside Braze
- External systems to check
- Whether the issue requires pausing a live canvas

Symptom: [describe]
Evidence so far: [what you've seen]
Recent changes: [what changed in last 24-48 hrs]
Affected canvas/campaign: [name]
Affected audience: [describe]
Time first noticed: [time]
```

### Pre-Launch QA Prompt

```
Review this Braze campaign/canvas configuration as a QA lead.
Identify possible issues with: audience, eligibility, re-entry, 
frequency caps, subscription status, Liquid, links, UTMs, promo codes, 
catalog lookups, conversion tracking, BrazeAI feature interactions, and reporting.
Provide a launch readiness verdict: Green / Watch / Do Not Launch.

Configuration: [paste canvas/campaign details]
```

### Liquid Debugging Prompt

```
Debug this Braze Liquid template. Identify:
- Syntax errors
- Missing default/fallback values
- Null handling gaps
- Incorrect date or currency formatting
- Any logic that could cause an abort

Template: [paste Liquid here]
```

---

## 📋 Section 19 — Role-Based Daily Checklists

### For CRM / Lifecycle Marketers

- [ ] Review active canvas and campaign performance overnight
- [ ] Check audience sizes before any scheduled send today
- [ ] Validate promo codes and offer accuracy
- [ ] Review unsubscribe, bounce, and complaint rates
- [ ] Confirm links, UTMs, and tracking are working
- [ ] Check top-performing and underperforming messages
- [ ] Confirm any stakeholder approvals required today

### For Braze Builders / Strategists

- [ ] Check canvas entry volumes and step-level drop-off
- [ ] Review Liquid errors and abort rates
- [ ] Validate catalog lookups and Connected Content responses
- [ ] Confirm test profiles behave as expected
- [ ] Check BrazeAI Decisioning Studio model health
- [ ] Verify no test content is live in production
- [ ] Review Zero-copy Canvas Trigger configurations

### For Data / Engineering

- [ ] Confirm API and SDK event pipelines are healthy
- [ ] Confirm event volumes are within normal range
- [ ] Confirm batch jobs and CDI syncs completed overnight
- [ ] Confirm catalog feeds updated
- [ ] Confirm Currents export running
- [ ] Review webhook failures and 4xx/5xx patterns
- [ ] Review schema changes that may impact Braze ingestion
- [ ] Check n8n / middleware workflow health

### For Managers / Program Leads

- [ ] Review executive summary and health score
- [ ] Confirm owner for each open action item
- [ ] Decide: pause / proceed / monitor for any flagged items
- [ ] Confirm launch readiness for today's planned sends
- [ ] Review any customer-facing incident status
- [ ] Escalation path confirmed for any 🔴 items

---

## ✏️ Section 20 — Morning Brief Narrative

> Write this in plain English. This is what you send to stakeholders.

**Overall:** The Braze instance is currently `🟢 Green / 🟡 Watch / 🔴 Action Required`.

**What looks healthy:**
-
-
-

**What needs attention today:**
-
-
-

**Key risk if no action taken:**
-

**Recommended actions before noon:**
1. [Action — Owner — Deadline]
2. [Action — Owner — Deadline]
3. [Action — Owner — Deadline]

---

### Email / Slack Distribution Template

```
Subject: Braze Morning Brief — YYYY-MM-DD — [Green / Watch / Action Required]

Good morning team,

Overall Braze status for [DATE]: [Green / Watch / Action Required]

Key highlights:
1. [Highlight]
2. [Highlight]
3. [Highlight]

Items needing attention:
1. [Issue — Owner — ETA]
2. [Issue — Owner — ETA]

Launches to monitor today:
- [Canvas / Campaign name and scheduled time]

Risks:
- [Risk and potential impact]

Actions before EOD:
- [Action]
- [Action]

Thanks,
[Name]
```

---

## ✅ Section 21 — Action Log

| # | Action | Priority | Owner | Due | Status | Notes |
|---|---|---|---|---|---|---|
| 1 | | 🔴 / 🟡 / 🟢 | | | Not Started / In Progress / Done / Blocked | |
| 2 | | | | | | |
| 3 | | | | | | |

---

## 🌙 Section 22 — End-of-Day Follow-Up

> Close the loop before tomorrow's brief.

- What was fixed today?
- What is still open and carries over to tomorrow?
- Were any canvases paused or relaunched?
- Were there any customer-facing impacts?
- Did reporting and event volumes normalize?
- Did all assigned owners complete their actions?
- What needs monitoring overnight?

---

## ⚡ Section 23 — 10-Minute Minimal Brief *(busy days only)*

When you only have 10 minutes, answer these 7 questions:

1. Is anything broken or erroring right now?
2. Did entries, sends, and conversions look normal yesterday?
3. Are any campaigns or canvases launching today?
4. Are data feeds, critical events, and CDI syncs healthy?
5. Are bounce, complaint, and unsubscribe rates within threshold?
6. Are promo codes, catalogs, and links working?
7. Who owns today's risks?

---

## 📝 Section 24 — My Daily Notes

```
Date:
Overall Status:
Biggest Win Today:
Biggest Risk Today:
Most Important Action:
Owner:
Deadline:
Follow-up Needed Tomorrow:
```

---

## 📚 Appendix — Recommended Automation Sources

To evolve this into a fully or semi-automated brief, pull data from:

| Source | Data Available |
|---|---|
| Braze Campaign Analytics API | Sends, opens, clicks, conversions, revenue |
| Braze Canvas Analytics API | Entries, exits, step-level performance |
| Braze User Profiles API | Attribute values, subscription status, test users |
| Braze Segments API | Segment sizes over time |
| Braze Catalogs API | Catalog freshness and item counts |
| Braze Currents | Real-time event stream for anomaly detection |
| Shopify / ecommerce webhooks | Order events, product stock levels |
| Cloud data warehouse | User attributes, purchase history, LTV |
| Email deliverability tools (Postmaster, SNDS, Validity) | Reputation signals |
| Webhook and API logs | Error rates, latency, timeout patterns |
| Promo code database / files | Remaining codes, redemption rates |
| Incident tracker (Jira / Linear / Asana) | Open tickets, blockers |
| Launch calendar (Notion / Confluence) | Planned sends and campaigns |
| Slack / Teams incident channels | Real-time escalations |
| n8n workflow logs | Automation health, error counts |

---

*Template version 2.0 — Braze Hypercare & Morning Brief*
*Covers: Forge 2025 · BrazeAI Decisioning Studio · Agent Console · Operator · Zero-copy Canvas Triggers · WhatsApp Commerce · RCS Rich Cards · Drag & Drop Blocks*
*Maintainer: {{YOUR_NAME}} | Last updated: {{DATE}} | Next review: {{REVIEW_DATE}}*
