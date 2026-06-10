# 🟠 Braze Morning Brief

> What broke · What's at risk · What ships today

**Date:** YYYY-MM-DD | **By:** Name | **Workspace:** Name | **Status:** 🟢 Green / 🟡 Watch / 🔴 Action Required

---

## 0. At a Glance *(write last)*

| Area | Status | Action Needed |
|---|---|---|
| Campaigns & Canvases | 🟢 / 🟡 / 🔴 | |
| Data & Events | 🟢 / 🟡 / 🔴 | |
| Deliverability | 🟢 / 🟡 / 🔴 | |
| Personalization & Liquid | 🟢 / 🟡 / 🔴 | |
| BrazeAI Features | 🟢 / 🟡 / 🔴 | |
| Promo Codes & Catalogs | 🟢 / 🟡 / 🔴 | |
| Incidents | 🟢 / 🟡 / 🔴 | |

**Top 3 for leadership:**
1. 
2. 
3. 

---

## 1. System Health

| Check | Status |
|---|---|
| status.braze.com | 🟢 / 🟡 / 🔴 |
| SDK / API ingestion lag | 🟢 / 🟡 / 🔴 |
| CDI / Zero-copy Canvas Triggers | 🟢 / 🟡 / 🔴 |
| Connected Content endpoints | 🟢 / 🟡 / 🔴 |
| Webhooks (no 4xx/5xx spike) | 🟢 / 🟡 / 🔴 |
| Currents export | 🟢 / 🟡 / 🔴 |

---

## 2. What Changed Yesterday?

| Item | Type | Environment | Impact | Owner |
|---|---|---|---|---|
| | Canvas / Campaign / Segment / API | Prod / Stage | | |

🚨 **Verify immediately if any of these changed:** trigger event name · audience filters · re-entry rules · Liquid / abort logic · promo code pool · webhook auth · sending domain · frequency caps

---

## 3. Canvas & Campaign Health

| Canvas / Campaign | Status | Entries 24hr | Errors | Flag |
|---|---|---|---|---|
| | Live / Paused | | | |

- [ ] Any canvas at zero entries unexpectedly?
- [ ] Users stuck at delay / decision split?
- [ ] Frequency caps silently suppressing key sends?
- [ ] Any A/B test hit significance — declare winner?

---

## 4. Data & Events

| Event | Expected | Actual | Variance | Status |
|---|---|---|---|---|
| `ecommerce.order_placed` | | | | 🟢 / 🟡 / 🔴 |
| `ecommerce.checkout_started` | | | | 🟢 / 🟡 / 🔴 |
| `back_in_stock_trigger` | | | | 🟢 / 🟡 / 🔴 |
| `refill_due` | | | | 🟢 / 🟡 / 🔴 |
| [Custom event] | | | | 🟢 / 🟡 / 🔴 |

> 🚨 Flag if any event drops 30%+ vs. 7-day average.

- [ ] Key event payload spot-checked (`external_id`, timestamp, required properties)
- [ ] Catalog / CDI sync completed overnight

---

## 5. Deliverability

| Metric | Yesterday | Threshold | Status |
|---|---|---|---|
| Delivery Rate | | > 98% | 🟢 / 🟡 / 🔴 |
| Hard Bounce Rate | | < 0.5% | 🟢 / 🟡 / 🔴 |
| Spam Complaint Rate | | < 0.08% | 🟢 / 🟡 / 🔴 |
| Unsubscribe Rate | | < 0.2% | 🟢 / 🟡 / 🔴 |

- [ ] DMARC / SPF / DKIM passing?
- [ ] ISP-level anomaly? (Gmail / Outlook / Yahoo / Apple)
- [ ] IP warming on track? *(pause if spam > 0.10% or hard bounce > 2%)*

---

## 6. Channel Checks

**Push:** APNs/FCM errors normal · tokens collecting · deep links working
**SMS:** correct subscription group · opt-outs processed · E.164 format
**WhatsApp:** Meta Catalog syncing · Flows submitting · Carousels loading · opt-in compliant
**RCS:** Rich Cards rendering · SMS fallback configured
**IAM:** no stale messages showing · Form Blocks submitting

---

## 7. Liquid & Personalization

- [ ] No broken Liquid in live templates — all vars have `| default:` fallback
- [ ] Abort logic (`{% abort_message %}`) intentional and monitored
- [ ] Connected Content: endpoints responding, timeout fallback set
- [ ] Promo code rendering: `{{ custom_attribute.${promo_code_issued} }}`

---

## 8. Promotion Codes

| Code List | Remaining | Issued Today | Redeemed | Expiring 48hr | Status |
|---|---|---|---|---|---|
| | | | | | 🟢 / 🟡 / 🔴 |

- [ ] Any list < 20% remaining? *(restock now)*
- [ ] `promo_code_issued` writing to profile on first send
- [ ] `promo_code_redeemed` updating on redemption
- [ ] Reminder Canvas filtering `redeemed = false` correctly
- [ ] Expired codes not visible in live templates

---

## 9. BrazeAI Health

| Feature | Status | Notes |
|---|---|---|
| Decisioning Studio (RL — optimising LTV/revenue) | 🟢 / 🟡 / 🔴 | |
| Agent Console (custom agents) | 🟢 / 🟡 / 🔴 | |
| Operator (prompt-based builds — human review required) | 🟢 / 🟡 / 🔴 | |
| Intelligent Timing / Channel | 🟢 / 🟡 / 🔴 | |
| Predictive Churn — model fresh? | 🟢 / 🟡 / 🔴 | |

---

## 10. Today's Sends — Pre-Launch Checklist

| Campaign / Canvas | Time | Audience | Channel | Test Send | Approved |
|---|---|---|---|---|---|
| | | | | ✅ / ❌ | ✅ / ❌ |

- [ ] Liquid resolves in test send · suppression lists applied · promo codes pulling
- [ ] Links, UTMs, from-name correct · conversion event mapped
- [ ] Pause plan ready if issues in first 30 minutes

---

## 11. Automation Health *(n8n)*

| Workflow | Last Run | Status | Errors |
|---|---|---|---|
| Back-in-Stock Trigger | | ✅ / ❌ | |
| Promo Code Issuer & Redeemed Updater | | ✅ / ❌ | |
| Refill Calculator & Expired Cleanup | | ✅ / ❌ | |

---

## 12. Action Log

| # | Action | Priority | Owner | Due | Status |
|---|---|---|---|---|---|
| 1 | | 🔴 / 🟡 / 🟢 | | | |
| 2 | | | | | |

---

## ⚡ 10-Min Version

1. Anything broken or erroring?
2. Entries, sends, conversions normal yesterday?
3. Today's launches ready?
4. Events and data feeds healthy?
5. Bounce / complaint / unsub within threshold?
6. Promo codes, catalogs, links working?
7. Who owns today's risks?

---

## 🤖 AI Prompt — Morning Triage

```
Act as a Braze hypercare analyst. Review the data below and return:
1) health status by area  2) anomalies vs baseline  3) root causes
4) recommended actions with owners  5) risks if ignored.
Data: [paste metrics]
```

---
*Braze Morning Brief v2.0 · Forge 2025: BrazeAI Decisioning Studio · Agent Console · Operator · Zero-copy Canvas Triggers · WhatsApp Commerce · RCS Rich Cards*
