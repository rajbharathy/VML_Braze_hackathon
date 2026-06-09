# Client Context
> Hackathon demo client — Campari Group
> This file is loaded at session start and remains in context throughout every conversation.

---

## Client Overview

**Client name:** Campari Group
**Industry:** Spirits & Beverages (FMCG)
**Primary market(s):** UK, US, Italy, Germany, Australia
**Braze contract tier:** Enterprise
**Engagement type:** BAU optimisation + strategic advisory
**Engagement start date:** January 2025
**Primary contact:** Head of Digital Marketing, Global

---

## Business Context

### What they sell
Campari Group is a global spirits company with a portfolio of over 50 brands including Aperol, Campari, Wild Turkey, Espolòn, Grand Marnier, and SKYY Vodka. They sell directly to consumers via brand experience platforms, cocktail communities, and loyalty programmes — primarily driving brand affinity, recipe engagement, and event participation rather than direct e-commerce.

### Key business objectives this engagement supports
- Increase repeat engagement among registered cocktail community members — target 40% 90-day retention
- Drive Aperol Spritz seasonal campaign performance across UK and US markets
- Grow loyalty programme membership and move users from bronze to silver tier within 60 days of registration
- Reduce lapsed community members — users with no engagement in 60+ days

### Key metrics they care about
- Recipe engagement rate (views, saves, attempts)
- Loyalty tier upgrade rate within 90 days
- Event registration conversion rate
- Push notification opt-in rate on mobile app
- 90-day retention of newly registered members

---

## Audience

### Key customer segments (business definition)
| Segment name | Description | Approximate size |
|---|---|---|
| Active Community Members | Registered users with at least one engagement in last 30 days | ~45,000 |
| New Registrants | Registered within last 30 days | ~8,000 |
| Lapsed Members | No engagement in 60–180 days | ~32,000 |
| Loyalty Bronze | Enrolled in loyalty programme, bronze tier | ~28,000 |
| Loyalty Silver | Silver tier — 500+ points | ~12,000 |
| Loyalty Gold | Gold tier — 1,500+ points | ~4,500 |
| Aperol Enthusiasts | Engaged with Aperol content or recipes 3+ times | ~18,000 |
| Event Attendees | Attended at least one brand event | ~6,000 |
| Push Opted-In | iOS or Android push enabled | ~22,000 |
| Email Opted-In | Marketing email subscribed | ~61,000 |

### Channel opt-in profile
- Email opted-in: 74%
- Push opted-in (iOS): 38%
- Push opted-in (Android): 29%
- SMS opted-in: N/A — not currently available
- WhatsApp: N/A — not in current contract

---

## Data Model

### Key custom attributes
| Attribute name | Type | Description | Example values |
|---|---|---|---|
| loyalty_tier | String | Current loyalty programme tier | bronze, silver, gold, platinum |
| loyalty_points | Number | Current points balance | 0–5000 |
| favourite_brand | String | Self-declared favourite Campari Group brand | aperol, campari, wild_turkey, espolon, grand_marnier |
| favourite_cocktail | String | Most engaged-with cocktail recipe | aperol_spritz, negroni, old_fashioned |
| registration_date | Date | Date user registered on the platform | 2025-01-15 |
| last_engagement_date | Date | Date of most recent platform interaction | 2025-05-20 |
| days_since_last_engagement | Number | Computed daily — days since last activity | 0–365 |
| events_attended | Number | Total brand events attended | 0–20 |
| recipes_saved | Number | Total recipes saved to profile | 0–50 |
| preferred_channel | String | Preferred communication channel | email, push |
| market | String | User's primary market | uk, us, it, de, au |
| age_verified | Boolean | Age verification completed | true, false |
| app_installed | Boolean | Campari app installed and active | true, false |

### Key custom events
| Event name | Description | Key properties |
|---|---|---|
| recipe_viewed | User viewed a cocktail recipe | recipe_id, brand, cocktail_name, time_spent_seconds |
| recipe_saved | User saved a recipe to their profile | recipe_id, brand, cocktail_name |
| recipe_attempted | User marked a recipe as attempted | recipe_id, brand, cocktail_name, rating |
| event_registered | User registered for a brand event | event_id, event_name, brand, location, event_date |
| event_attended | User checked in at a brand event | event_id, event_name, brand, location |
| loyalty_points_earned | Points awarded for an action | points_awarded, action_type, new_balance, tier |
| loyalty_tier_upgraded | User moved to a higher tier | previous_tier, new_tier, points_balance |
| app_session_started | App opened | session_source, device_type, market |
| profile_completed | User completed their profile | completion_percentage, fields_added |
| cocktail_quiz_completed | User completed a brand quiz | quiz_id, brand, score, recommended_cocktail |

---

## Ecosystem Architecture

### Connected platforms
| Platform | Type | Connection method | What it provides |
|---|---|---|---|
| Loyalty platform (Antavo) | Loyalty | Webhook + Connected Content API | Points balance, tier status, available rewards, next tier threshold |
| Campari brand app (iOS + Android) | Mobile | Braze SDK v9.0 | Events, sessions, push, IAM, content cards |
| Campari web platform | Web | Braze Web SDK | Recipe views, event registrations, form submissions |
| Snowflake | Data warehouse | Braze Currents | Full engagement event history, used for BI reporting |
| Content catalogue | CMS | Braze Catalogs (daily sync) | Recipe name, brand, image URL, difficulty, cocktail type, ingredients |

### What is technically possible
- Real-time loyalty points balance and tier status available via Connected Content from Antavo API at message render time — use `:cache_body 300` (5 minute cache)
- Up to 5 recipe recommendations per message via Braze Catalogs catalog_items lookup
- Event details (name, date, location, image) available via Catalogs
- Push notifications available on iOS and Android — web push not configured
- In-app messages available on iOS and Android
- Content cards available on iOS and Android
- Age verification status available as a custom attribute — always check age_verified == true before any alcohol-related promotional send
- Market-level targeting available via the `market` custom attribute

### What is NOT possible
- SMS — not in current contract
- WhatsApp — not in current contract
- Web push — web SDK deployed but push not configured
- Transactional email — all sends are marketing only, transactional IP not set up
- Real-time purchase data — Campari does not sell direct to consumer, no purchase events
- Geofencing — not currently implemented despite events use case

---

## Constraints and Preferences

### Compliance and legal
- Age verification required — never send alcohol promotional content to users where age_verified != true
- GDPR applies to UK, EU markets — consent required before any marketing send
- US CAN-SPAM compliance required for US market sends
- Responsible drinking messaging must be included in all promotional email footers
- No sends to under-18s under any circumstances — age gate is enforced at registration

### Brand and tone
- Tone of voice: sophisticated, celebratory, warm. Never corporate or formal.
- Aperol: bright, social, optimistic. Summer and aperitivo occasion focused.
- Campari: bold, artistic, passionate. Negroni culture and cocktail craft focused.
- Wild Turkey: authentic, rugged, American heritage. Whiskey connoisseur focused.
- Brand name: always use full brand names — "Aperol" not "A", "Campari" not "C"
- Emoji: permitted in push and subject lines for Aperol. More restrained for Campari and Wild Turkey.
- CTA style: always occasion or experience led — "Discover the recipe", "Join the community", never "Click here"

### Client preferences and sensitivities
- Maximum 2 email sends per user per week across all brands
- Maximum 1 push notification per user per day
- A/B test required on any send to more than 25,000 users
- Age verification check must be applied to every Canvas entry criteria — no exceptions
- Events content must be market-specific — never send UK event invitations to US users
- Responsible drinking footer is non-negotiable on all email sends

---

## Current Programme State

### Active Canvases (high level)
- Welcome journey — triggers on registration, 3-step email + push series over 7 days
- Loyalty onboarding — triggers on loyalty enrolment, introduces tier structure and first action prompt
- Recipe engagement — weekly recipe recommendation based on favourite_brand attribute
- Event reminder — triggers 48h and 2h before registered events
- Lapsed re-engagement — triggers at 60 days no engagement, 3-step series

### Known issues or priorities
- Welcome Canvas copy has not been updated since Q4 2024 — predates the cocktail quiz feature
- Lapsed re-engagement Canvas has 8% conversion against a 15% target — step 2 drop-off suspected
- No post-event Canvas exists — users who attend events receive no follow-up
- Loyalty tier upgrade moment has no dedicated Canvas — a significant missed engagement opportunity
- Recipe engagement Canvas does not use the favourite_cocktail attribute — currently brand-level only

### Upcoming campaigns
- Aperol Spritz Summer 2025 — multi-market activation planned for June, brief not yet finalised
- Wild Turkey Father's Day campaign — US market, mid-June
- Negroni Week — global campaign, third week of June, Campari brand lead