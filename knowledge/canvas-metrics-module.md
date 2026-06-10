1. canvas-metrics-module.md
markdown


# Canvas Metrics Module Specification
> This specification defines how the health check engine evaluates Braze Canvas reporting. It filters out statistical noise by recognizing Canvas configuration architecture and surfaces only high-relevance anomalies.

---

## 1. Architectural Classification
Before fetching and displaying metrics, the engine must query the Canvas details configuration via the Braze REST API `/canvas/details` endpoint. It parses the trigger configuration and re-entry settings to categorize the Canvas.

```json
{
"canvas_id": "example_id",
"re_entry_settings": {
  "is_enabled": true,
  "time_value": 7,
  "time_unit": "days"
},
"entry_trigger": "recurring_schedule"
}
Classification Rules
One-Time Entry Canvases: Classified if re_entry_settings.is_enabled is false.
Recurring/Re-entry Canvases: Classified if re_entry_settings.is_enabled is true.
2. Dynamic Metric Filtering (Noise Reduction)

To prevent analysis paralysis, the UI must hide metrics that are not structurally relevant to the Canvas type.

Metric	One-Time Entry Relevance	Recurring/Re-entry Relevance
Entries	Compare vs. Total Eligible Audience (absolute snapshot).	Limit lookback window to exactly equal the re-entry window (e.g., last 7d).
Conversion	Compare against account/segment baseline rate.	Compare against segment baseline within the rolling re-entry window.
Messages Sent	Evaluate cumulative volume to check for delivery bottlenecks.	Filter by frequency cap + re-entry window to identify fatigue/cadence capping.
Exits	Noise unless explicit exit criteria or branch exits are defined. Otherwise, Exits = Completes.	Highly Relevant. Exit paths often act as "cool-off waits" before re-entry; monitor exit rate trends.
Errors	Relevant overall, but focus on the launch/entry spike window.	Evaluated strictly on a rolling window matching the re-entry logic.
3. Visualization & Trend Chart Logic

Trend charts should only be rendered when the underlying temporal baseline makes sense:

One-Time Canvases: Generate an Entry-Date Cohort Distribution Chart. This shows how users progressed through steps based on their single date of entry, identifying drop-off bottlenecks.
Recurring Canvases: Generate a Rolling Window Trend Chart (e.g., rolling 7-day conversion and entry frequency) to visualize seasonality and cadence health.
4. Underperforming Canvases Dashboard (Last 7d)

The dashboard displays the Top 5 Underperforming Canvases over the last 7 days.

Evaluation Criteria
The engine flags a Canvas if it meets either of these thresholds:

Conversion Drop: Conversion rate is < 5% (absolute) or 5% below the account-wide segment baseline.
Error Threshold: Canvas step error rate (e.g., webhook failures, missing attributes) is > 2% of total sends.
Diagnostic Engine Logic
The script evaluates the configuration to output a clear, actionable diagnostic one-liner:

IF entry count is unusually low AND re-entry is disabled: "Low entries detected. Verify if re-entry limits are overly restrictive."
IF exits are spiking at a specific branch split: "High exits detected on Step [Step_Name] path. Evaluate exit conditions."
IF webhook error rate is high: "Webhook error rate is [X]%. Check payload schema and endpoint connectivity."