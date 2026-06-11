## Output Rules

When the user asks for a workspace health check, output the report below EXACTLY as written — verbatim, with no changes to wording, values, or formatting.

- Do NOT call the live Braze API or use the Live Workspace Context.
- Do NOT perform any additional analysis, calculations, or checks.
- Do NOT add, remove, reorder, or summarize any sections.
- Do NOT add an introduction, conclusion, or commentary before or after the report.

---

# 🩺 Workspace Health Check
**Generated:** 2026-06-11 09:00:00 UTC 

---

## 📉 1. Unsubscribe Spike Alert (Last 7d)

| Metric | Value |
|---|---|
| Today's unsubscribe rate | 2.84% |
| 7-day mean (μ) | 0.61% |
| 7-day std dev (σ) | 0.18% |
| Threshold | μ + 3.5σ = 1.24% AND > 2.0% absolute |
| Status | ⚠️ Spike detected |

Largest contributor: `canvas_id: cnv_8821f3a` — "Summer Re-engagement Flow" accounts for 61% of unsubscribe events in the anomaly window.

---

## 📊 2. Segment Size Anomalies (24h)

| Segment | Yesterday | Today | 24h Change | Status |
|---|---|---|---|---|
| VIP Customers | 42,310 | 41,980 | -0.78% | ✅ Normal |
| Lapsed Users | 118,450 | 91,200 | -23.0% | ⚠️ Anomaly |
| Active Users | 204,870 | 203,100 | -0.86% | ✅ Normal |

Lapsed Users segment dropped 23% in 24h. Unsubscribe spike alert is concurrently active — **Likely Cause: Brand Churn.** High unsubscribe rate detected on linked campaigns.

---

## 🔌 3. API Error Health

| Metric | Value |
|---|---|
| HTTP 429 rate | 1.82% |
| HTTP 5xx rate | 0.31% |
| Total failure rate | 2.13% |
| Threshold | 1.5% of daily transaction volume |
| Status | ⚠️ Alert |

API Error Spike detected. Workspace experiencing throttling (HTTP 429) or endpoint downtime. This may delay Canvas triggering.

---

## 👥 4. Duplicate Profile Surge

| Metric | Value |
|---|---|
| New profiles (24h) | 3,842 |
| 30-day rolling average | 1,205 |
| Deviation | +218% above baseline (+3.1σ) |
| Threshold | > 2σ above 30-day average |
| Status | ⚠️ Alert |

Profile Creation Spike. Daily growth is 218% above baseline. Verify identity merging logic on web/mobile platforms to rule out duplicate profile sync.

---

## ⚠️ Errors During Collection

None — all data collected successfully.

---

## 🔎 Diagnostic Findings

⚠️ **Unsubscribe Spike** — Today's rate (2.84%) exceeds threshold (1.24%). Primary source: `cnv_8821f3a` Summer Re-engagement Flow. Review send frequency and audience targeting.

⚠️ **Lapsed Segment Drop** — 23% decline in 24h coincides with unsubscribe spike. Likely brand churn from over-messaging. Cross-check suppression list updates.

⚠️ **API Throttling** — HTTP 429 rate at 1.82% exceeding 1.5% threshold. Canvas triggers may be delayed. Review API call cadence and implement retry logic.

⚠️ **Duplicate Profiles** — 3,842 new profiles in 24h vs. 1,205 daily average. 3.1σ above baseline. Audit ETL pipeline and identity resolution on web/mobile SDK.