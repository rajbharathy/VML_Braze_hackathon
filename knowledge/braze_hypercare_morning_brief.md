# 🟠 Braze Hypercare & Morning Brief

> **Daily operating brief for Braze practitioners.**
> What happened yesterday · What's at risk today · What needs action now.

---

## 📋 Brief Header

| Field | Value |
|---|---|
| **Date** | YYYY-MM-DD |
| **Prepared by** | Name |
| **Workspace** | Workspace name |
| **Environment** | Production / Staging |
| **Overall status** | 🟢 Green / 🟡 Watch / 🔴 Action Required |

---

## 0. Executive Summary *(write last, read first)*

| Area | Status | Summary | Owner |
|---|---|---|---|
| Campaigns & Canvases | 🟢 / 🟡 / 🔴 | | |
| Data Ingestion & Events | 🟢 / 🟡 / 🔴 | | |
| Email Deliverability | 🟢 / 🟡 / 🔴 | | |
| Push / SMS / WhatsApp | 🟢 / 🟡 / 🔴 | | |
| Personalization & Liquid | 🟢 / 🟡 / 🔴 | | |
| BrazeAI Features | 🟢 / 🟡 / 🔴 | | |
| Promo Codes & Catalogs | 🟢 / 🟡 / 🔴 | | |
| Incidents / Open Issues | 🟢 / 🟡 / 🔴 | | |

**Top 3 things leadership needs to know:**
1. 
2. 
3. 

---

## 1. System Health

> Check before trusting anything else.

| Check | Status |
|---|---|
| Braze Status Page (status.braze.com) | 🟢 / 🟡 / 🔴 |
| SDK / REST API ingestion lag | 🟢 / 🟡 / 🔴 |
| Currents export running | 🟢 / 🟡 / 🔴 |
| Connected Content endpoints responsive | 🟢 / 🟡 / 🔴 |
| Webhooks firing (no 4xx/5xx spike) | 🟢 / 🟡 / 🔴 |
| Zero-copy Canvas Triggers syncing | 🟢 / 🟡 / 🔴 |
| Cloud Data Ingestion (CDI) healthy | 🟢 / 🟡 / 🔴 |

---

## 2. What Changed Since Yesterday?

> Most incidents are caused by undocumented changes. Check these first.

| Item changed | Type | Environment | Impact | Owner |
|---|---|---|---|---|
| | Canvas / Campaign / Segment / Catalog / API | Prod / Stage | | |

**Instant red flags — verify immediately if any of these changed:**
- Trigger event name or properties
- Audience entry filters or re-entry eligibility
- Decision split or Audience Path logic
- Liquid personalization or abort logic
- Promotion code pool or catalog lookup keys
- Webhook endpoint, auth credentials, or API keys
- Sending domain, From name, or Reply-to address
- Quiet hours, frequency caps, or rate limits

---

## 3. Campaign & Canvas Health

### Active Canvas Monitor

| Canvas | Status | Entries (24hr) | Sends | Conversions | Errors | Notes |
|---|---|---|---|---|---|---|
| | Live / Paused | | | | | |

### Entry & Journey Checks

- [ ] Any canvas at zero entries unexpectedly?
- [ ] Users stuck before a delay step or decision split?
- [ ] Re-entry rules blocking users they shouldn't?
- [ ] Frequency caps silently suppressing key sends?
- [ ] Conversion events correctly mapped?
- [ ] A/B splits still balanced? Any test hit significance — declare winner?
- [ ] Exit criteria triggering too early or not at all?

---

## 4. Data Ingestion & Event Health

### Critical Events Monitor

| Event | Expected Vol | Actual Vol | Variance | Status |
|---|---|---|---|---|
| `ecommerce.order_placed` | | | | 🟢 / 🟡 / 🔴 |
| `ecommerce.checkout_started` | | | | 🟢 / 🟡 / 🔴 |
| `back_in_stock_trigger` | | | | 🟢 / 🟡 / 🔴 |
| `refill_due` | | | | 🟢 / 🟡 / 🔴 |
| `subscription_started` | | | | 🟢 / 🟡 / 🔴 |
| `app_session_start` | | | | 🟢 / 🟡 / 🔴 |
| [Custom event] | | | | 🟢 / 🟡 / 🔴 |

> 🚨 Flag immediately if any event drops 30%+ vs. 7-day average.

**Event payload QA (spot-check one key event daily):**
- [ ] `external_id` present and valid
- [ ] Timestamp in ISO 8601 format
- [ ] Required properties non-null
- [ ] No unexpected schema change since last deploy
- [ ] eCommerce attributes flowing correctly

### Data Freshness

| Source | Last Sync | Cadence | Status |
|---|---|---|---|
| Shopify / ecommerce source | | Real-time | 🟢 / 🟡 / 🔴 |
| Data warehouse (CDI) | | | 🟢 / 🟡 / 🔴 |
| Product catalog feed | | Daily | 🟢 / 🟡 / 🔴 |
| Promotion code files | | As needed | 🟢 / 🟡 / 🔴 |
| Currents export | | Continuous | 🟢 / 🟡 / 🔴 |

---

## 5. User Profile Health

- [ ] New users creating at expected volume
- [ ] No duplicate profiles (consistent `external_id`)
- [ ] Push tokens valid and collecting
- [ ] Phone numbers in E.164 format
- [ ] Subscription states updating correctly across all channels
- [ ] `promo_code_issued` / `redeemed` / `expiry` attributes not overwritten
- [ ] Test profiles not polluting production reports

### Segment Size Watch

| Segment | Today | Yesterday | Delta | Flag if >±20% |
|---|---|---|---|---|
| | | | | 🟢 / ⚠️ |

---

## 6. Email Deliverability

| Metric | Yesterday | 7-Day Avg | Threshold | Status |
|---|---|---|---|---|
| Delivery Rate | | | > 98% | 🟢 / 🟡 / 🔴 |
| Hard Bounce Rate | | | < 0.5% | 🟢 / 🟡 / 🔴 |
| Spam Complaint Rate | | | < 0.08% | 🟢 / 🟡 / 🔴 |
| Unsubscribe Rate | | | < 0.2% | 🟢 / 🟡 / 🔴 |
| Open Rate | | | | 🟢 / 🟡 / 🔴 |
| Click Rate | | | | 🟢 / 🟡 / 🔴 |

### ISP-Level Check

| Provider | Bounce Rate | Complaint Rate | Status |
|---|---|---|---|
| Gmail | | | 🟢 / 🟡 / 🔴 |
| Outlook / Hotmail | | | 🟢 / 🟡 / 🔴 |
| Yahoo | | | 🟢 / 🟡 / 🔴 |
| Apple / iCloud | | | 🟢 / 🟡 / 🔴 |

- [ ] DMARC / SPF / DKIM all passing?
- [ ] Any campaigns sending to cold or inactive users?
- [ ] IP warming on track? *(if active — pause if spam rate > 0.10% or hard bounce > 2%)*

---

## 7. Channel Health

### Push
- [ ] APNs / FCM errors within normal range
- [ ] Push tokens collecting on new installs
- [ ] Deep links working
- [ ] Rich push images loading

### SMS
- [ ] Correct subscription group attached
- [ ] Opt-outs processed
- [ ] Compliance language present (STOP instructions)
- [ ] Phone numbers valid (E.164)

### WhatsApp *(Forge 2025)*
- [ ] Commerce catalog syncing from Meta Catalog
- [ ] Flows (interactive forms) submitting correctly
- [ ] Carousels loading images and CTAs
- [ ] 24-hour session window respected for non-template sends
- [ ] Opt-in compliance maintained

### RCS *(Forge 2025)*
- [ ] Rich Cards rendering (media, text, tappable actions)
- [ ] SMS fallback configured for non-RCS devices

### In-App Messages / Content Cards
- [ ] Trigger rules working, no stale messages showing
- [ ] Drag & Drop Form Blocks submitting correctly *(Forge 2025)*
- [ ] CTAs and close buttons functional

---

## 8. Personalization & Liquid

**Daily Liquid safety check:**
- [ ] No broken Liquid syntax in live templates
- [ ] All variables have `| default:` fallback values
- [ ] Null values handled (especially arrays)
- [ ] Abort logic (`{% abort_message %}`) intentional and monitored
- [ ] Connected Content timeout fallback configured
- [ ] Promo code attribute rendering: `{{ custom_attribute.${promo_code_issued} }}`

### Connected Content Health

| Endpoint | Used In | Last Response | Avg Latency | Status |
|---|---|---|---|---|
| Inventory API | Back-in-Stock | | ms | 🟢 / 🟡 / 🔴 |
| Product API | Refill Reminder | | ms | 🟢 / 🟡 / 🔴 |
| Recommendation Engine | Cross-sell | | ms | 🟢 / 🟡 / 🔴 |

---

## 9. Promotion Codes

| Code List | Remaining | Issued Today | Redeemed Today | Expiring 48hr | Status |
|---|---|---|---|---|---|
| | | | | | 🟢 / 🟡 / 🔴 |

- [ ] Any list below 20% remaining? *(restock now)*
- [ ] Same code not issued to multiple users
- [ ] `promo_code_issued` writing to profile correctly on first send
- [ ] `promo_code_redeemed = true` updating on redemption (via webhook/n8n)
- [ ] Reminder Canvas filtering `promo_code_redeemed = false` correctly
- [ ] Expired codes not showing in live templates

---

## 10. BrazeAI Feature Health

| Feature | Active On | Status | Notes |
|---|---|---|---|
| **Decisioning Studio** (RL model, optimising for LTV/revenue) | | 🟢 / 🟡 / 🔴 | |
| **Agent Console** (custom agents, content/localization automation) | | 🟢 / 🟡 / 🔴 | |
| **Operator** (prompt-based campaign building — human review required) | | 🟢 / 🟡 / 🔴 | |
| **Content Optimizer Agent** (subject line/copy optimization) | | 🟢 / 🟡 / 🔴 | |
| Intelligent Timing | | 🟢 / 🟡 / 🔴 | |
| Intelligent Channel | | 🟢 / 🟡 / 🔴 | |
| Predictive Churn — model freshness | | 🟢 / 🟡 / 🔴 | |
| AI Copywriting Assistant | | 🟢 / 🟡 / 🔴 | |

> ⚠️ Any AI Operator or Agent-generated content must be human-reviewed before going live.

---

## 11. Today's Planned Sends

| Campaign / Canvas | Time | Audience Size | Channel | Test Send Done | Approved |
|---|---|---|---|---|---|
| | | | | Yes / No | Yes / No |

### Pre-Send Checklist

- [ ] Liquid resolves correctly in test send
- [ ] Correct segment attached, size reviewed
- [ ] Suppression lists applied (unsubscribes, internal, QA profiles)
- [ ] Promo codes assigned and pulling
- [ ] Links, UTMs, and tracking working
- [ ] From name / reply-to correct
- [ ] Send time and timezone correct
- [ ] Re-entry and max-sends-per-user set
- [ ] Conversion event mapped
- [ ] Pause plan ready if issues appear in first 30 minutes

---

## 12. Automation Health *(n8n / middleware)*

| Workflow | Last Run | Status | Errors | Alert Firing |
|---|---|---|---|---|
| Back-in-Stock Trigger | | ✅ / ❌ | | Yes / No |
| Promo Code Issuer | | ✅ / ❌ | | Yes / No |
| Promo Code Redeemed Updater | | ✅ / ❌ | | Yes / No |
| Refill Date Calculator | | ✅ / ❌ | | Yes / No |
| Expired Code Cleanup | | ✅ / ❌ | | Yes / No |

- [ ] No workflows failing silently
- [ ] Braze API rate limits not being hit (no 429s)
- [ ] Webhook payloads matching Braze schema

---

## 13. Compliance & Privacy

- [ ] Data deletion requests received? *(process within SLA)*
- [ ] Any unsubscribes or opt-outs not yet honoured?
- [ ] Suppressed users not included in any active segments?
- [ ] Data retention jobs ran overnight?
- [ ] No PII exposed in logs or event properties?
- [ ] WhatsApp opt-in compliance maintained *(explicit consent)*
- [ ] SMS compliance language present on all sends

---

## 14. Anomaly Radar

| Signal | Threshold | Actual | Status |
|---|---|---|---|
| Event volume drop | > 30% vs 7-day avg | | 🟢 / 🔴 |
| Canvas entries drop | > 30% vs 7-day avg | | 🟢 / 🔴 |
| Hard bounce spike | > 0.5% | | 🟢 / 🔴 |
| Spam complaint spike | > 0.08% | | 🟢 / 🔴 |
| Unsubscribe spike | > 0.2% | | 🟢 / 🔴 |
| Segment size shift | > ±20% overnight | | 🟢 / 🔴 |
| Webhook error increase | > 10% of calls | | 🟢 / 🔴 |
| Promo code list low | < 20% remaining | | 🟢 / 🔴 |
| API rate limit hit | Any 429s | | 🟢 / 🔴 |

---

## 15. Action Log

| # | Action | Priority | Owner | Due | Status |
|---|---|---|---|---|---|
| 1 | | 🔴 / 🟡 / 🟢 | | | Not Started / In Progress / Done |
| 2 | | | | | |
| 3 | | | | | |

---

## 16. Morning Narrative & Distribution

**Overall:** Instance is `🟢 Green / 🟡 Watch / 🔴 Action Required`

**What's healthy:**
-

**What needs attention:**
-

**Key risk if no action taken:**
-

**Actions before noon:**
1. [Action — Owner — ETA]
2. [Action — Owner — ETA]

---

```
Subject: Braze Morning Brief — YYYY-MM-DD — [Green / Watch / Action Required]

Good morning team,

Status for [DATE]: [Green / Watch / Action Required]

Highlights:
1.
2.

Attention needed:
1. [Issue — Owner — ETA]

Launches today: [Canvas / Campaign — time]

Thanks,
[Name]
```

---

## ⚡ 10-Minute Version *(busy days)*

1. Is anything broken or erroring right now?
2. Did entries, sends, and conversions look normal yesterday?
3. Are any campaigns launching today — are they ready?
4. Are data feeds and critical events healthy?
5. Are bounce, complaint, and unsubscribe rates within threshold?
6. Are promo codes, catalogs, and links working?
7. Who owns today's risks?

---

## 🤖 AI Prompt Toolkit

**Morning triage:**
```
Act as a Braze hypercare analyst. Review the data below and produce:
1) executive summary 2) health status by area 3) anomalies vs baseline
4) root causes 5) recommended actions with owners 6) risks if ignored.
Data: [paste metrics]
```

**Root cause:**
```
Troubleshoot this Braze issue. List likely causes in priority order,
what to check in Braze, what external systems to check, and whether
to pause the canvas.
Symptom: | Recent changes: | Canvas affected: | Time noticed:
```

**Pre-launch QA:**
```
Review this Braze canvas config as a QA lead. Flag issues with audience,
re-entry, frequency caps, Liquid, links, promo codes, catalog lookups,
BrazeAI interactions, and conversion tracking.
Verdict: Green / Watch / Do Not Launch.
Config: [paste]
```

---

*Braze Hypercare & Morning Brief v2.0 · Covers Forge 2025: BrazeAI Decisioning Studio · Agent Console · Operator · Zero-copy Canvas Triggers · WhatsApp Commerce · RCS Rich Cards*
