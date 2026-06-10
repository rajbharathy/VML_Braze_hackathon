# Canvas Categorization & Portfolio Mapping — Agent Instructions
> This document instructs the Canvas-analysis agent on how to audit a client's Braze workspace, categorize all Active Canvases by type, and build a portfolio map. This categorization informs the Canvas Brief Agent's understanding of the client's Canvas ecosystem and messaging patterns.

---

## Overview

The Canvas Categorization agent will:
1. **Connect to the client's Braze workspace** (via Braze REST API)
2. **Fetch all Active Canvases** (status = "active" or "paused", exclude drafts/archived)
3. **Analyze each Canvas** against categorization logic
4. **Tag each Canvas** with its assigned category in Braze

This tagging is persistent. The Canvas Brief Agent will query Canvases by tag to understand the ecosystem and avoid duplicate/conflicting builds.

---

## Canvas Category Definitions

### 1. WELCOME-TYPE CANVAS
**Purpose:** Onboard new customers or prospects immediately after account creation or signup.

**Identifying Characteristics:**
- **Segment patterns:** `LIFECYCLE__NEW_CUSTOMER`, `LIFECYCLE__NEW_USER`, `WELCOME_SERIES`, `ONBOARDING`, or custom attributes like `days_since_signup <= 7` or `first_purchase_date == today`
- **Trigger:** Scheduled (immediate/within 24hr of account creation) OR Action-based (on `user_registered`, `account_created`, `signup_completed` event)
- **Filters:** Often includes `is_new_user == true` or `signup_date == today` or time-bound (e.g., "created in last 7 days")
- **Canvas Name patterns:** "Welcome", "New User", "Onboarding", "Get Started", "Activation"
- **Journey:** 3–5 step sequence over 7–14 days introducing brand, setting expectations, driving first action (first purchase, profile completion, etc.)
- **Messaging tone:** Warm, instructional, action-oriented (setup steps, product intro, first-time buyer offer)

**Decision Logic:**
```
IF segment contains "NEW" or "WELCOME" or "ONBOARDING"
  AND (trigger is Scheduled on signup date OR action is user_registered/account_created)
  THEN → Tag: Welcome
  
ELSE IF segment contains "WELCOME" 
  AND entry_audience explicitly filters for days_since_signup <= 7
  THEN → Tag: Welcome
```

---

### 2. LIFECYCLE-TYPE CANVAS
**Purpose:** Engage customers at specific lifecycle moments (birthdays, win-back, lapsed engagement, hyperlapsed/at-risk).

**Sub-types to identify:**
- **Birthday:** Triggered on `customer_birthday == today` or annual recurring date. Messaging: celebratory offer, exclusive gift, VIP treatment.
- **Win-back:** Targets lapsed customers (no purchase in 90–180 days). Usually one-time or monthly recurring. Messaging: nostalgia, reactivation incentive, "we miss you".
- **Lapsed:** Customers inactive 30–90 days. Regular cadence (weekly/monthly). Messaging: engagement reactivation, exclusive offer, "come back".
- **Hyperlapsed / At-risk:** Customers at high churn risk (no engagement in 180+ days or matching churn prediction model). Messaging: urgent/last-chance, VIP retention offer.
- **Re-engagement:** General re-activation of inactive customers. Messaging: soft nudge, new content/features, value reminder.

**Identifying Characteristics:**
- **Segment patterns:** `LIFECYCLE__LAPSED`, `LIFECYCLE__CHURNED`, `LIFECYCLE__AT_RISK`, `LIFECYCLE__WINBACK`, `LIFECYCLE__BIRTHDAY`, `LIFECYCLE__ANNIVERSARY` or similar
- **Trigger:** Recurring Daily (on customer's birthday or fixed date) OR Scheduled (anniversary dates) OR Audience-based (e.g., "all users with last_purchase_days >= 90")
- **Filters:** Time-based attributes like `last_purchase_days >= 90`, `days_since_last_engagement >= 180`, `birthday == today`, `account_anniversary == today`
- **Canvas Name patterns:** "Birthday", "Winback", "Lapsed", "At-Risk", "Reactivation", "Anniversary", "Churn Prevention"
- **Journey:** 1–3 step sequence, often over 7–30 days. May include decision splits based on engagement.
- **Messaging tone:** Empathetic, incentive-driven, nostalgia or urgency

**Decision Logic:**
```
IF segment contains "BIRTHDAY" OR name contains "Birthday"
  AND (trigger is Recurring Daily OR action is customer_birthday)
  THEN → Tag: Lifecycle

ELSE IF segment contains "LAPSED" or "CHURNED" or "AT_RISK"
  AND (last_purchase_days >= 30 OR days_since_engagement >= 30)
  THEN → Tag: Lifecycle

ELSE IF segment contains "WINBACK" or name contains "Winback" or name contains "Win-back"
  AND (last_purchase_days >= 90 OR similar churn filter)
  THEN → Tag: Lifecycle

ELSE IF segment contains "ANNIVERSARY" or name contains "Anniversary"
  AND (account_anniversary == today or similar date-based trigger)
  THEN → Tag: Lifecycle
```

---

### 3. BEHAVIORAL CANVAS
**Purpose:** Respond to specific user actions (browsing, abandonment, engagement events) with timely, contextual messages.

**Sub-types to identify:**
- **Abandon Cart:** Triggered on `cart_abandoned` event. Drives checkout completion.
- **Abandon Checkout:** Triggered when user initiated checkout but abandoned. Differs from cart abandon (more committed).
- **Post Browse:** Triggered on `product_viewed` or `category_browsed` events. Nurtures interest, shares reviews/recommendations.
- **Post Purchase:** Triggered on `purchase` event. Cross-sell, upsell, review requests, usage tips.
- **Engagement-based:** Triggered on specific app/web actions (video watched, content clicked, form started, etc.). Nurtures ongoing engagement.
- **Form Abandonment:** Triggered on `form_started_not_completed`. Recovers incomplete signups/registrations.

**Identifying Characteristics:**
- **Segment:** Often uses broad segments (e.g., "All Users") with behavioral filters, OR custom behavior-based segments like `BEHAVIOR__CART_ABANDONERS`, `BEHAVIOR__HIGH_ENGAGERS`, `BEHAVIOR__PRODUCT_BROWSERS`
- **Trigger:** Action-based. Event name is key identifier: `cart_abandoned`, `product_viewed`, `purchase`, `form_started`, `video_watched`, `link_clicked`, `app_opened`, etc.
- **Filters:** Often include time filters (e.g., "event occurred in last 24 hours") and property filters (e.g., `cart_value >= 50` for high-value abandons)
- **Canvas Name patterns:** "Abandon Cart", "Post Browse", "Post Purchase", "Browse Recovery", "Engagement", "Review Request", "Winback"
- **Journey:** 2–4 step sequence, typically 3–7 days. Conditional logic based on user engagement with prior step.
- **Messaging tone:** Action-oriented, contextual, FOMO-driven (for cart abandon), helpful (for post-purchase)

**Decision Logic:**
```
IF trigger is Action-based 
  AND event_name in (cart_abandoned, checkout_abandoned, product_viewed, product_browsed, 
                      post_purchase, purchase, form_started, engagement_event, etc.)
  THEN → Tag: Behavioural

ELSE IF segment contains "BEHAVIOR__" 
  AND trigger is Action-based or time-filtered
  THEN → Tag: Behavioural
  
ELSE IF name contains any of: "Abandon", "Browse", "Post Purchase", "Recovery", "Engagement"
  AND trigger is Action-based
  THEN → Tag: Behavioural
```

---

### 4. TRANSACTIONAL CANVAS
**Purpose:** Deliver system-triggered, non-promotional messages essential to user experience (order confirmations, password resets, account notifications).

**Identifying Characteristics:**
- **Segment:** Usually targets broad segments or "All Users" without demographic filtering. No affinity/engagement-based segmentation.
- **Trigger:** API-triggered (Canvas triggered via REST API call with user properties) OR Action-based on system events like `order_placed`, `password_reset_requested`, `account_created`, `email_verified`, `subscription_changed`, `shipment_updated`, etc.
- **Filters:** Minimal filters; usually triggered universally or with light transactional property filters (e.g., "where order_id exists")
- **Canvas Name patterns:** "Order Confirmation", "Password Reset", "Verification Email", "Account Alert", "Subscription Confirmation", "Transactional", "System Notification"
- **Journey:** Typically 1 step (single email/SMS) or minimal conditional logic. No re-entry loops.
- **Messaging tone:** Neutral, factual, system-oriented. No promotional language. Includes transaction details (order #, link, code, etc.)
- **Content:** Dynamic data insertion ({{order_id}}, {{reset_link}}, {{recipient_email}}, etc.)

**Decision Logic:**
```
IF trigger is API-triggered
  THEN → Tag: Transactional

ELSE IF trigger is Action-based
  AND event_name in (order_placed, password_reset_requested, email_verified, 
                      account_created, subscription_confirmed, shipment_updated, 
                      invoice_generated, etc.)
  AND (name contains "Confirmation" OR "Verification" OR "Alert" OR "Reset" OR "Notification")
  THEN → Tag: Transactional

ELSE IF Canvas has NO promotional language, NO offers/discounts, NO re-entry logic
  AND contains transaction data (order #, link, code)
  THEN → Tag: Transactional (likely missed by name/trigger)
```

---

### 5. BATCH CANVAS
**Purpose:** Regular or ad-hoc broadcasts of curated content, seasonal announcements, or promotional campaigns to broad audiences (one-time scheduled sends).

**Sub-types to identify:**
- **Recurring Newsletter:** Weekly/bi-weekly/monthly sends of curated content.
- **Seasonal Campaign:** One-time send for holidays, product launches, events.
- **Brand Announcement:** One-time send announcing new products, features, policy changes.
- **Promotional Blast:** One-time or recurring broad promotional send.

**Identifying Characteristics:**
- **Segment:** Broad audience segments (e.g., `ALL_SUBSCRIBERS`, `EMAIL_OPT_IN`, `AFFINITY__BRAND_NAME`) with minimal exclusions. Often NO behavioral filtering.
- **Trigger:** Scheduled (recurring: Daily/Weekly/Monthly at fixed time, OR one-time at specific date/time)
- **Filters:** Often simple: country, language, email_opt_in == true. Minimal temporal/behavioral filters.
- **Canvas Name patterns:** "Newsletter", "Weekly Digest", "Seasonal Campaign", "[Brand] - [Season/Event]", "Product Launch", "Flash Sale", "Holiday Campaign"
- **Journey:** Often 1–2 steps. Simple linear flow (send email ± conditional follow-up). Minimal decision logic.
- **Messaging tone:** Editorial, brand voice, promotional, community-oriented. Curated content.
- **Audience size:** Typically large (10K–100K+ users)

**Decision Logic:**
```
IF trigger is Scheduled (Recurring Daily/Weekly/Monthly OR one-time at fixed date)
  AND segment is broad (ALL_SUBSCRIBERS, EMAIL_OPT_IN, or AFFINITY__)
  AND (name contains "Newsletter" OR "Digest" OR "Campaign" OR "Seasonal" OR "Announcement")
  THEN → Tag: Batch

ELSE IF trigger is Scheduled
  AND audience_size > 10,000
  AND minimal behavioral filtering (only demographic/geographic/opt-in filters)
  THEN → Tag: Batch

ELSE IF Canvas has NO conditional logic, NO re-entry, ONE or TWO steps, linear journey
  AND is scheduled
  THEN → Tag: Batch (likely editorial/promotional content)
```

---

## Tagging Strategy

Once a Canvas is categorized, apply the corresponding tag in Braze:

---

## Tagging Strategy

Once a Canvas is categorized, apply the corresponding tag in Braze using the Canvas API:

| Category | Tag Name |
|----------|----------|
| Welcome-Type | `Welcome` |
| Lifecycle-Type | `Lifecycle` |
| Behavioral-Type | `Behavioural` |
| Transactional-Type | `Transactional` |
| Batch Canvas | `Batch` |

**Tag application:**
- Each Canvas should have ONE primary category tag
- If a Canvas is ambiguous or hybrid, apply the primary tag only (see Ambiguity Rules below)
- Tags are added via Braze Canvas API: `PATCH /canvas/{id}/tags` → add `{"tags": ["Welcome"]}`

**Canvas Brief Agent reference:**
- When starting a new brief, the agent can query: "List all Canvases tagged 'Behavioural'" to see existing behavioral Canvas patterns
- This helps avoid duplication and ensures consistency with existing builds

---

## Categorization Ambiguity Rules

**When a Canvas fits multiple categories:**

1. **Hierarchy:** Apply this priority order (top wins):
   - Transactional (if API-triggered or system event, always transactional)
   - Welcome (if targets new users/signup, always welcome)
   - Lifecycle (if targets specific lifecycle stage)
   - Behavioural (if triggered by user action)
   - Batch (default fallback)

2. **Tag assignment:** Assign only the primary category tag. Don't create multi-tag Canvases.

3. **Unclear cases:** If categorization is ambiguous:
   - Use the hierarchy above to break ties
   - Add a note in Canvas description if needed: "[Categorized as: Batch]"
   - Move forward with best guess (tags can be corrected later)

---

## Agent Workflow

1. **Connect to Braze workspace** via REST API (auth: API key from client)
2. **Fetch all Canvases** with status = "active" or "paused" (exclude drafts)
3. **For each Canvas:**
   - Read Canvas metadata (name, trigger type, entry audience, filters)
   - Apply categorization logic (see category definitions)
   - Determine primary category
4. **Apply tag** via Canvas API using category tag name
5. **Report:** Log which Canvases were tagged with which categories
6. **Done** — Canvas Brief Agent can now query by tag

---

## External References

When categorizing, the agent should:
- **Consult client-context.md** for segment definitions and naming conventions
- **Check tracking plan** for event definitions (to validate action-based triggers)
- **Reference Braze workspace settings** for any org-specific Canvas patterns or conventions

---