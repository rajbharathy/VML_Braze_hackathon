# 🚀 Braze Launch Hypercare Dashboard

## Purpose

Analyze newly launched canvases and identify launch risks during the first 72 hours after go-live.

---

# Data Source Rules

Use the canvases provided in the **SAMPLE CANVAS DATA** section of your knowledge base as the sole dataset for this analysis.

### Restrictions

* Do NOT call the live Braze API
* Do NOT query the current Braze workspace
* Do NOT retrieve live Canvas data
* Use only:

  * details
  * data_series
  * data_summary

---

# Canvas Eligibility Rules

Include ONLY canvases where:

* details.archived = false
* details.draft = false
* details.first_entry exists
* details.first_entry occurred within the last 72 hours

---

# 📋 Card 1 — Launch Health Matrix

| Canvas          | First Entry | Entries | Sends | Conversions | Exits | Health | Key Observation      |
| --------------- | ----------- | ------- | ----- | ----------- | ----- | ------ | -------------------- |
| Welcome Series  | 18h ago     | 5,212   | 5,108 | 318         | 72    | 🟢     | Healthy launch       |
| Abandoned Cart  | 27h ago     | 1,155   | 1,148 | 92          | 44    | 🟢     | Healthy launch       |
| Loyalty Tier Up | 42h ago     | 817     | 804   | 33          | 188   | 🟡     | Exit volume elevated |
| Prospects Promo | 61h ago     | 17      | 0     | 0           | 0     | 🔴     | Entries but no sends |

### Health Logic

🟢 Healthy

* Entries present
* Sends present
* Normal progression

🟡 Monitoring

* Activity present
* Potential anomaly detected

🔴 At Risk

* Missing sends
* Missing progression
* Abnormally high exits
* No activity after launch

---

# 🔍 Card 2 — Journey Integrity Findings

Display only canvases with issues.

### 🔴 Critical

**Prospects Promo**

* 17 users entered
* 0 messages sent

Possible causes:

* Audience filter
* Message disabled
* Canvas step configuration
* Liquid abort logic

### 🟡 Warning

**Loyalty Tier Up**

* Exit volume significantly above peer canvases

Possible causes:

* Conversion event mismatch
* Eligibility filtering
* Delay timing issue

---

# ⚠️ Card 3 — Investigation Queue

| Priority | Canvas          | Issue                      | Recommended Check                  |
| -------- | --------------- | -------------------------- | ---------------------------------- |
| P1       | Prospects Promo | No sends after entry       | Message step configuration         |
| P2       | Loyalty Tier Up | High exits                 | Exit criteria and conversion logic |
| P3       | Abandoned Cart  | Lower than expected volume | Entry event validation             |

---

# 🤖 Card 4 — AI Summary

## What Went Live?

* 4 canvases launched in the last 72 hours

## Findings

* 1 canvas requires immediate investigation
* 1 canvas requires monitoring
* 2 canvases operating normally

## Recommended Actions

1. Investigate canvases with entries but no sends
2. Review canvases with elevated exits
3. Validate entry volume against expected launch forecast

## Overall Risk

🟡 Medium

```
Potential customer impact detected in one newly launched journey.
```

---

# Output Rules

* Keep under 300 words
* Prioritize operational issues
* Focus on launch validation
* Surface only actionable findings
* Do not invent missing metrics
* Explicitly state when data is unavailable
