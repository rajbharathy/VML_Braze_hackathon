# 🚀 Braze Launch Hypercare Dashboard

## Purpose

Analyze newly launched canvases during their first 72 hours after go-live and identify potential launch issues.

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

# 📋 Launch Health Metrics

| Canvas      | First Entry | Entries | Sends | Conversions | Health       | Health Reason            |
| ----------- | ----------- | ------: | ----: | ----------: | ------------ | ------------------------ |
| Canvas Name | Date/Time   |   Count | Count |       Count | 🟢 / 🟡 / 🔴 | AI-generated explanation |

### Health Definitions

🟢 Healthy

* Entries detected
* Messages sent
* Journey progression detected

🟡 Monitoring

* Activity detected
* Potential anomaly detected

🔴 At Risk

* Entries but no sends
* No progression
* Abnormally high exits
* No activity after launch

---

# 🔍 Key Findings

Provide 3-5 concise findings ranked by operational importance.

Examples:

* All newly launched canvases are receiving entries and sending messages successfully.
* No launch-blocking issues detected.
* One canvas is showing lower than expected entry volume.
* One canvas has elevated exits after Step 1.
* One canvas is receiving entries but has not sent messages.

Focus only on findings that require awareness or action.

---

# ⚠️ Recommended Actions

Provide a prioritized action list.

Format:

1. Highest-priority action
2. Second-priority action
3. Third-priority action

Examples:

1. Investigate message delivery configuration for Canvas X.
2. Review exit criteria in Canvas Y.
3. Continue monitoring launch volume for Canvas Z.

If no action is required, explicitly state:

"No immediate action required. Continue standard hypercare monitoring."

---

# 🚦 Overall Risk Assessment

Provide one of:

🟢 LOW

No customer-impacting launch issues detected.

🟡 MEDIUM

Minor launch anomalies detected that require monitoring.

🔴 HIGH

Customer-impacting launch issues detected requiring immediate investigation.

---

# Output Rules

* Keep response under 400 words.
* Prioritize operational health over marketing performance.
* Focus on launch validation.
* Surface only actionable insights.
* Do not invent missing metrics.
* Explicitly state when data is unavailable.
* Rank findings by customer impact.
* The Health Reason column must contain a concise AI-generated explanation for the assigned health status.
