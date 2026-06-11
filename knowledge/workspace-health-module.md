# Workspace Health Module Specification
> Rules for evaluating real-time workspace health, alerting campaign managers to spikes in user distress, system failures, and API degradation.

---

## 1. Unsubscribe Spike Alert (Last 7d)
* **Action:** Intercept rapid brand damage or poor segmentation early.
* **Logic:**
1. Calculate the daily unsubscribe rate for the last 7 days.
2. Calculate the historical mean (μ) and standard deviation (σ) of the daily rate.
* **Alert Trigger Rule:** 
Today's Unsubscribe Rate > (μ_7d + 3.5σ) AND Today's Unsubscribe Rate > 2.0% (absolute)
* **Drill-down Output:** Fetch the specific `campaign_id` or `canvas_id` that represents the largest share of unsubscribe events during the anomaly window.

---

## 2. Segment Size Anomalies
* **Action:** Detect filter logic failures or sudden churn waves in key segments.
* **Logic:** Compare segment size snapshots on a rolling 24-hour cycle.
* **Alert Trigger Rule:** Flag any key customer segment (e.g., VIP, Lapsed, Active) that experiences a drop of `> 20%` in absolute member count over a 24-hour window.
* **Diagnostic Engine Hypothesis:**
* *IF unsubscribe spike alert is concurrently active:* 
  `"Likely Cause: Brand Churn. High unsubscribe rate detected on linked campaigns."`
* *IF unsubscribe rate is stable:* 
  `"Likely Cause: Filter Exclusion. Check if a recent CRM attribute sync or data structure update excluded users."`

---

## 3. API Error Health
* **Action:** Differentiate between campaign setup issues and platform infrastructure failures.
* **Logic:** Track API request/response statuses on integration endpoints.
* **Metrics Tracked:**
* **HTTP 429 Rate:** Out of rate limits / throttling.
* **HTTP 5xx Rate:** Server-side failures.
* **Alert Trigger Rule:** Flag if the API request failure rate exceeds `1.5%` of total daily transaction volume.
* **Diagnostic Message:** 
`"API Error Spike detected. Workspace experiencing throttling (HTTP 429) or endpoint downtime. This may delay Canvas triggering."`

---

## 4. Duplicate Profile Surge Flag
* **Action:** Detect integration errors (e.g., bad ETL runs, lack of merging) before they blow out billing limits.
* **Logic:** Evaluate total profile counts daily.
* **Alert Trigger Rule:** Flag if the volume of newly created user profiles within a 24-hour period rises `> 2 standard deviations (2σ)` above the rolling 30-day average.
* **Diagnostic Message:** 
`"Profile Creation Spike. Daily growth is [X]% above baseline. Verify identity merging logic on web/mobile platforms to rule out duplicate profile sync."`

---

## Report Format

Always produce the report in this exact structure:

---

# 🩺 Workspace Health Check
**Generated:** {collectedAt}

---

## 📉 1. Unsubscribe Spike Alert (Last 7d)

| Metric | Value |
|---|---|
| Today's unsubscribe rate | {unsubscribe.todayRate} |
| 7-day mean (μ) | {unsubscribe.mean} |
| 7-day std dev (σ) | {unsubscribe.stdDev} |
| Threshold | μ + 3.5σ, and > 2.0% absolute |
| Status | ✅ Normal / ⚠️ Spike detected |

If triggered, name the `campaign_id`/`canvas_id` with the largest share of unsubscribe events in the anomaly window.

---

## 📊 2. Segment Size Anomalies (24h)

| Segment | 24h Change | Status |
|---|---|---|
| {segment.name} | {segment.change} | ✅ / ⚠️ |

For any segment flagged (>20% drop), apply the Diagnostic Engine Hypothesis logic above.

---

## 🔌 3. API Error Health

| Metric | Value |
|---|---|
| HTTP 429 rate | {api.rate429} |
| HTTP 5xx rate | {api.rate5xx} |
| Threshold | 1.5% of daily transaction volume |
| Status | ✅ Normal / ⚠️ Alert |

---

## 👥 4. Duplicate Profile Surge

| Metric | Value |
|---|---|
| New profiles (24h) | {profiles.new24h} |
| 30-day rolling average | {profiles.avg30d} |
| Threshold | > 2σ above 30-day average |
| Status | ✅ Normal / ⚠️ Alert |

---

## ⚠️ Errors During Collection

If errors array is not empty, list them here clearly. If empty, write "None — all data collected successfully."

---

## 🔎 Diagnostic Findings

For each metric with status ⚠️, output the corresponding Diagnostic Message / Hypothesis defined above. If no alerts triggered, write "No anomalies detected — workspace is healthy."

---

## Tone Rules

- Be factual and precise
- Use ⚠️ for any metric that breaches its trigger rule
- Use ✅ for metrics within normal range
- Do not invent data — only report what is in the raw API data
- If a field errored or could not be retrieved, say so clearly rather than showing 0 or "Normal"

---

**Output note:** Do not add any additional sections apart from what is defined above — no executive summary, no recommendations, no appendix.