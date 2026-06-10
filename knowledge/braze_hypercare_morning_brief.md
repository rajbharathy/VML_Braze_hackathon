# BRAZE MORNING BRIEF GENERATION INSTRUCTIONS

## Analysis Rules (Mandatory)

Use the canvases provided in the **SAMPLE CANVAS DATA** section of your knowledge base as the sole dataset for this analysis.

### Data Source Restrictions

* Do NOT call the live Braze API.
* Do NOT query the current Braze workspace.
* Do NOT retrieve live Canvas data.
* Do NOT use any external source of Canvas information.
* Use only:

  * `details`
  * `data_series`
  * `data_summary`

objects contained within **SAMPLE CANVAS DATA**.

### Canvas Eligibility Rules

Include ONLY canvases where:

```text
details.archived = false
AND
details.draft = false
```

Exclude:

* Archived canvases
* Draft canvases
* Deleted canvases
* Any canvas missing performance data

### Analysis Window

Analyse activity for the last 72 hours using the available metrics in SAMPLE CANVAS DATA.

---

# ☀️ Braze Morning Brief

**Date:** {{today}}
**Analysis Window:** Last 72 Hours

---

# 🚨 Card 1: Instance Health

## Health Score

{{health_score}} / 100

### Summary

* Active Canvases Analysed: {{count}}
* Canvases with No Issues: {{count}}
* Canvases Requiring Review: {{count}}

### Alerts

* {{alert_1}}
* {{alert_2}}

---

# 📬 Card 2: Messaging Activity

### Canvas Activity

| Metric          | Value     |
| --------------- | --------- |
| Active Canvases | {{count}} |
| Messages Sent   | {{count}} |
| Entry Events    | {{count}} |
| Conversions     | {{count}} |
| Exit Events     | {{count}} |

### Exceptions

List canvases with:

* Significant drop in sends
* Significant drop in conversions
* Unexpected spikes or declines
* High exit volume

---

# 🛒 Card 3: Customer Journey Signals

### Positive Trends

* {{canvas_name}} increased conversions by {{x}}%
* {{canvas_name}} increased sends by {{x}}%

### Negative Trends

* {{canvas_name}} decreased conversions by {{x}}%
* {{canvas_name}} decreased sends by {{x}}%

### Silent Journeys

Identify active canvases with:

* No sends in the last 72 hours
* No entries in the last 72 hours
* No conversions in the last 72 hours

---

# 📈 Card 4: Top & Bottom Performers

## Top 3 Canvases

🥇 {{canvas_name}}

* Conversion Rate: {{rate}}
* Sends: {{count}}

🥈 {{canvas_name}}

* Conversion Rate: {{rate}}
* Sends: {{count}}

🥉 {{canvas_name}}

* Conversion Rate: {{rate}}
* Sends: {{count}}

## Canvases Needing Attention

⚠️ {{canvas_name}}

* Reason: {{reason}}

⚠️ {{canvas_name}}

* Reason: {{reason}}

---

# 🤖 Card 5: Executive Summary

## What Happened?

Provide a concise summary of notable changes observed across all eligible canvases during the last 72 hours.

## Biggest Change

Identify the single largest positive or negative trend.

## Recommended Investigation

Recommend the highest-priority canvas or metric to review today and explain why.

## Risk Level

🟢 Low
🟡 Medium
🔴 High

---

# Output Requirements

* Keep the entire report under 500 words.
* Prioritise anomalies over normal behaviour.
* Focus on actionable insights.
* Do not mention excluded canvases.
* Do not invent missing metrics.
* If data is unavailable, explicitly state "Data not available in SAMPLE CANVAS DATA."
* Rank findings by business impact.
