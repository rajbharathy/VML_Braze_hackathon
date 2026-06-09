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
| Aperol Enthusiasts | affinity_aperitifs == true | ~18,000 |
| Dark Spirits Fans | affinity_dark_spirits == true | ~14,000 |
| Tequila Fans | affinity_tequila == true | ~9,000 |
| Event Attendees | event_rsvp fired at least once | ~6,000 |
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
| is_legal_drinking_age | Boolean | Age verification passed — must be true before any alcohol promotional send | true, false |
| birth_date | Date/Time | User's date of birth — used for age verification and birthday campaigns | 1990-05-15 |
| country_residence | String | User's country of residence — used for market targeting and compliance | uk, us, it, de, au |
| preferred_language | String | User's preferred language for communications | en, it, de, fr, es |
| favorite_brand | String | User's self-declared or inferred favourite Campari Group brand | aperol, campari, wild_turkey, espolon, grand_marnier, skyy |
| affinity_aperitifs | Boolean | User has demonstrated affinity for aperitif-style drinks | true, false |
| affinity_dark_spirits | Boolean | User has demonstrated affinity for dark spirits — whiskey, rum, brandy | true, false |
| affinity_tequila | Boolean | User has demonstrated affinity for tequila — Espolòn targeting | true, false |
| persona_type | String | Derived persona based on engagement behaviour and preferences | cocktail_enthusiast, casual_drinker, brand_loyalist, explorer, gifter |
| is_loyalty_member | Boolean | User is enrolled in the loyalty programme | true, false |
| loyalty_points_balance | Number | Current loyalty points balance | 0–5000 |
| loyalty_tier | String | Current loyalty programme tier | bronze, silver, gold, platinum |
| last_engagement_date | Date | Date of most recent platform interaction | 2025-05-20 |
| days_since_last_engagement | Number | Computed daily — days since last activity | 0–365 |
| app_installed | Boolean | Campari app installed and active | true, false |
| events_attended | Number | Total brand events attended | 0–20 |
| recipes_saved | Number | Total recipes saved to profile | 0–50 |
| preferred_channel | String | Preferred communication channel | email, push |

### Key custom events
| Event name | Description | Key properties |
|---|---|---|
| age_gate_passed | User successfully passes the age gate | country, age_gate_version, entry_point |
| age_gate_failed | User fails the age gate | country, age_gate_version |
| brand_page_viewed | User views a brand landing page | brand, campaign, channel, locale |
| product_detail_viewed | User views a product detail page | brand, product_id, product_name, category, abv |
| recipe_viewed | User views a cocktail recipe | brand, recipe_id, recipe_name, occasion |
| recipe_saved | User saves a recipe to their profile | recipe_id, brand |
| store_locator_used | User searches the store locator | country, city, query, intent |
| location_selected | User selects a specific store or venue | location_id, location_type, city, country |
| event_viewed | User views an event page | event_id, event_name, city, country, start_at |
| event_rsvp | User RSVPs to an event | event_id, rsvp_status, guest_count |
| ticket_purchased | User purchases an event ticket | event_id, value, currency, quantity |
| newsletter_signup | User submits email signup form | brand, source, double_opt_in |
| consent_updated | User's consent preferences change | consent_type, consent_state, source |
| qr_scanned | User scans a QR code from packaging or POS | brand, campaign, placement, qr_id |
| promotion_redeemed | User redeems a promotional offer | promo_id, brand, value, channel |
| purchase_completed | Purchase transaction completes | order_id, value, currency, items_count, brand |
| customer_support_contacted | User initiates a support interaction | topic, channel |

---

## Ecosystem Architecture

### Connected platforms
| Platform | Type | Connection method | What it provides |
|---|---|---|---|
| Salesforce Marketing Cloud | Legacy CRM | REST API nightly sync | Historical contact data, email suppression list |
| Antavo | Loyalty | Webhook + Connected Content API | Points balance, tier status, available rewards, next tier threshold |
| Campari brand app (iOS + Android) | Mobile | Braze SDK v9.0 | Events, sessions, push, IAM, content cards |
| Campari web platform | Web | Braze Web SDK | Recipe views, event registrations, form submissions |
| Snowflake | Data warehouse | Braze Currents | Full engagement event history, used for BI reporting |
| Content catalogue | CMS | Braze Catalogs (daily sync) | Recipe name, brand, image URL, difficulty, cocktail type, ingredients |
| Events catalogue | Events platform | Braze Catalogs (daily sync) | Event name, brand, city, country, date, ticket URL, image |

### What is technically possible
- Real-time loyalty points balance and tier status available via Connected Content from Antavo API at message render time — use `:cache_body 300` (5 minute cache)
- Up to 5 recipe recommendations per message via Braze Catalogs `catalog_items` lookup
- Event details (name, date, location, image) available via Catalogs
- Push notifications available on iOS and Android — web push not configured
- In-app messages available on iOS and Android
- Content cards available on iOS and Android
- `is_legal_drinking_age == true` must be validated in every Canvas entry criteria — never skip this
- Market-level targeting available via `country_residence` — prefer this over any other market attribute for compliance targeting
- Brand affinity targeting available via `affinity_aperitifs`, `affinity_dark_spirits`, `affinity_tequila`
- Persona-based routing available via `persona_type`
- Action-based Canvas entry available on `age_gate_passed`, `recipe_saved`, `event_rsvp`, `qr_scanned`, `newsletter_signup`

### What is NOT possible
- SMS — not in current contract
- WhatsApp — not in current contract
- Web push — web SDK deployed but push not configured
- Transactional email — all sends are marketing only, transactional IP not set up
- Real-time purchase data via Braze purchase object — using `purchase_completed` custom event instead
- Geofencing — not currently implemented

---

## Constraints and Preferences

### Compliance and legal
- `is_legal_drinking_age == true` required on every Canvas entry criteria — non-negotiable, no exceptions
- GDPR applies to UK and EU markets — `consent_updated` event must be respected immediately
- US CAN-SPAM compliance required for all US market sends
- Responsible drinking messaging must be included in all promotional email footers
- Market-specific content required — never send UK event invitations to users where `country_residence != uk`
- Age gate version must be current — flag any Canvas using an outdated age gate flow

### Brand and tone
- Aperol: bright, social, optimistic — summer and aperitivo occasion focused
- Campari: bold, artistic, passionate — Negroni culture and cocktail craft focused
- Wild Turkey: authentic, rugged, American heritage — whiskey connoisseur focused
- Espolòn: vibrant, creative, Mexican heritage — tequila cocktail culture focused
- Never abbreviate brand names — always "Aperol" not "A", "Campari" not "C"
- Emoji: permitted in push and subject lines for Aperol and Espolòn — more restrained for Campari and Wild Turkey
- CTA style: always occasion or experience led — "Discover the recipe", "Join the community" — never "Click here"
- Always use `preferred_language` attribute for market localisation where available

### Client preferences and sensitivities
- Maximum 2 email sends per user per week across all brands combined
- Maximum 1 push notification per user per day
- A/B test required on any send to more than 25,000 users
- Events content must always be filtered by `country_residence` — never send cross-market event invitations
- Responsible drinking footer is non-negotiable on all email sends
- Loyalty messaging must always reference current `loyalty_points_balance` and next tier threshold

---

## Current Programme State

### Active Canvases
The copilot reads all active Canvases live from the Braze API. No manual list required.

### Segments to be created in sandbox
> The team will create these in the hackathon sandbox. The copilot will read IDs live from the API once created.
- `CORE__EMAIL_OPTED_IN` — all email subscribed users with `is_legal_drinking_age == true`
- `CORE__PUSH_OPTED_IN` — all push enabled users with `is_legal_drinking_age == true`
- `LIFECYCLE__NEW_REGISTRANTS` — `age_gate_passed` within last 30 days
- `LIFECYCLE__LAPSED_60` — `days_since_last_engagement` >= 60
- `LIFECYCLE__LAPSED_90` — `days_since_last_engagement` >= 90
- `LOYALTY__IS_MEMBER` — `is_loyalty_member == true`
- `LOYALTY__BRONZE` — `loyalty_tier == bronze`
- `LOYALTY__SILVER` — `loyalty_tier == silver`
- `LOYALTY__GOLD` — `loyalty_tier == gold`
- `AFFINITY__APERITIFS` — `affinity_aperitifs == true`
- `AFFINITY__DARK_SPIRITS` — `affinity_dark_spirits == true`
- `AFFINITY__TEQUILA` — `affinity_tequila == true`
- `BRAND__APEROL_FANS` — `favorite_brand == aperol`
- `BRAND__CAMPARI_FANS` — `favorite_brand == campari`
- `MARKET__UK` — `country_residence == uk`
- `MARKET__US` — `country_residence == us`

### Catalogs to be created in sandbox
> The team will create these. The copilot will reference them in Canvas message content.
- `recipes` — recipe_id, recipe_name, brand, occasion, difficulty, image_url, ingredients_summary, cocktail_url
- `events` — event_id, event_name, brand, city, country, start_at, ticket_url, image_url, capacity
- `products` — product_id, product_name, brand, category, abv, description, image_url