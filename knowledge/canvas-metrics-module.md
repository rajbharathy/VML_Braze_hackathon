\## Module Specification



**1. Canvas Status Filter** 

Before any analysis begins, the agent \*\*must\*\* filter canvases by status.

\*\*Rule:\*\* Only canvases with `status: "active"` are eligible for analysis.  

Canvases in the following states \*\*must be excluded\*\*:



| Status    | Include in Analysis? |

|-----------|----------------------|

| `active`  | ✅ Yes               |

| `draft`   | ❌ No                |

| `stopped` | ❌ No                |

| `archived`| ❌ No                |



\*\*Implementation Note:\*\*  

When calling the Braze Canvas List API, apply the status filter at the query level.

Do not retrieve all canvases and filter post-fetch.

```json

GET /canvas/list?status=active



**2. Canvas Classification \& Architecture**

Each active canvas is classified based on its re\_entry\_settings configuration.

Example Canvas Data Structure:

{

"canvas\_id": "example\_id",

"re\_entry\_settings": {

&#x20; "is\_enabled": true,

&#x20; "time\_value": 7,

&#x20; "time\_unit": "days"

},

"entry\_trigger": "recurring\_schedule"

}

Classification Rules:

•	One-Time Entry Canvas: Classified if re\_entry\_settings.is\_enabled is false

•	Recurring / Re-entry Canvas: Classified if re\_entry\_settings.is\_enabled is true



**3. Dynamic Metric Filtering (Noise Reduction)**

To prevent analysis paralysis, metrics not structurally relevant to the canvas type are suppressed.

| Metric          | One-Time Entry   | Recurring / Re-entry     |

|-----------|----------------------|----------------------|                                                                           

| Entries          | Compare vs. total eligible audience (absolute snapshot).  | Limit lookback window to exactly equal the re-entry window (e.g., last 7 days).                        |

| Conversion       | Compare against account/segment baseline rate.  | Compare against segment baseline within the rolling re-entry window.                                   |

| Messages Sent    | Evaluate cumulative volume to check for delivery bottlenecks.  | Filter by frequency cap + re-entry window to identify fatigue/cadence capping.                         |

| Exits            | Noise unless explicit exit criteria or branch exits are defined. Otherwise, Exits = Completes. | Highly relevant. Exit paths often act as "cool-off waits" before re-entry; monitor exit rate trends.  |

| Errors           | Relevant overall, but focus on the launch/entry spike window.  | Evaluated strictly on a rolling window matching the re-entry logic.                                    |



**4. Visualization \& Trend Chart Logic**

Trend charts are only rendered when the underlying temporal baseline is valid.

•	One-Time Canvases: Generate an Entry-Date Cohort Distribution Chart.

Shows how users progressed through steps based on their single date of entry, identifying drop-off bottlenecks.

•	Recurring Canvases: Generate a Rolling Window Trend Chart

(e.g., rolling 7-day conversion and entry frequency) to visualise seasonality and cadence health.



**5.Underperforming Canvases Dashboard (Last 7 Days)**

•	Displays the Top 5 Underperforming Active Canvases over the last 7 days.

•	Evaluation Criteria

•	A canvas is flagged if it meets either of the following thresholds:

Threshold	Condition

Conversion Drop	Conversion rate is < 5% (absolute) OR 5% below account-wide segment baseline

Error Threshold	Canvas step error rate (e.g., webhook failures, missing attributes) > 2% of total sends



**6.Diagnostic Engine Logic**

The engine outputs a single, actionable diagnostic line per flagged canvas:

|Condition|	Diagnostic Output|

|Entry count unusually low AND re-entry is disabled	|"Low entries detected. Verify if re-entry limits are overly restrictive."|

|Exits spiking at a specific branch split	|"High exits detected on Step \[Step\_Name] path. Evaluate exit conditions."|

|Webhook error rate elevated	|"Webhook error rate is \[X]%. Check payload schema and endpoint connectivity."|



**7. Output Scope Constraints**

The agent output for this module must be limited to the following sections only:

Section	Include in Output?

Canvas classification summary	✅ Yes

Dynamic metric table per canvas type	✅ Yes

Trend chart (relevant type only)	✅ Yes

Top 5 underperforming canvases list	✅ Yes

Diagnostic one-liner per flagged canvas	✅ Yes

The agent must not volunteer information outside of this scope, even if it identifies potential issues in the canvas configuration.



