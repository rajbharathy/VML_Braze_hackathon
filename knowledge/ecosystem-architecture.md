# Ecosystem Architecture
> This file tells the copilot what is technically possible in this client's world.
> The copilot will never recommend something that requires a capability not listed here as available.

---

## Braze Configuration

### SDK deployment
| Platform | SDK deployed | Version | Notes |
|---|---|---|---|
| iOS | [Yes/No] | [VERSION] | [e.g. Push enabled, IAM enabled] |
| Android | [Yes/No] | [VERSION] | [e.g. Push enabled, IAM enabled] |
| Web | [Yes/No] | [VERSION] | [e.g. Web push not configured] |

### Channels available
- [ ] Email (marketing)
- [ ] Email (transactional)
- [ ] Push — iOS
- [ ] Push — Android
- [ ] Push — Web
- [ ] In-app messages
- [ ] Content cards
- [ ] SMS
- [ ] WhatsApp
- [ ] Webhooks (outbound)

### Braze features in use
- [ ] Catalogs
- [ ] Connected Content
- [ ] Liquid personalisation
- [ ] A/B testing / multivariate
- [ ] Winning variant
- [ ] Intelligent timing
- [ ] Intelligent channel
- [ ] Frequency capping
- [ ] Global control group
- [ ] Currents (data export)
- [ ] Predictive churn
- [ ] Predictive events

---

## Data Infrastructure

### Data flow into Braze
| Source | Method | Frequency | Data types |
|---|---|---|---|
| [e.g. CDP] | [e.g. Braze native SDK / REST API] | [e.g. Real-time] | [e.g. Events, attributes, purchases] |
| [e.g. Data warehouse] | [e.g. Reverse ETL via Hightouch] | [e.g. Daily batch] | [e.g. Computed segments, LTV scores] |
| [e.g. E-commerce platform] | [e.g. Direct SDK] | [e.g. Real-time] | [e.g. Purchase events, cart events] |

### Data flow out of Braze
| Destination | Method | Frequency | Purpose |
|---|---|---|---|
| [e.g. Data warehouse] | [e.g. Currents] | [e.g. Real-time stream] | [e.g. Analytics, attribution] |
| [e.g. CRM] | [e.g. Webhook] | [e.g. Event-triggered] | [e.g. Update contact record on conversion] |

---

## Connected Content APIs

### Available endpoints
| Endpoint | What it returns | Latency | Auth method | Cache TTL |
|---|---|---|---|---|
| [e.g. https://api.client.com/loyalty/balance] | [e.g. Points balance, tier, next reward threshold] | [e.g. <500ms] | [e.g. Bearer token in header] | [e.g. 5 minutes] |
| [e.g. https://api.client.com/recommendations] | [e.g. Up to 5 personalised product recommendations] | [e.g. <800ms] | [e.g. API key in query param] | [e.g. 1 hour] |

### Connected Content constraints
- Maximum response size the team has validated: [e.g. 50KB]
- Timeout setting in use: [e.g. 3 seconds]
- Rate limits to be aware of: [e.g. Loyalty API — 100 req/sec max]
- Endpoints that are NOT suitable for real-time use: [FILL IN]

---

## Braze Catalogs

### Available catalogs
| Catalog name | Contents | Key fields | Use cases |
|---|---|---|---|
| [e.g. products] | [e.g. Full product catalogue — 4,200 items] | [e.g. product_id, name, price, image_url, category, in_stock] | [e.g. Abandoned cart, recommendations] |
| [e.g. stores] | [e.g. Store locations — 340 locations] | [e.g. store_id, name, address, lat, lng, opening_hours] | [e.g. Nearest store messaging] |
| [e.g. offers] | [e.g. Active promotional offers] | [e.g. offer_id, description, discount_pct, expiry_date, eligible_tiers] | [e.g. Loyalty tier offers] |

---

## Webhook Integrations

### Outbound webhooks from Braze
| Destination | Trigger | Payload | Purpose |
|---|---|---|---|
| [e.g. Loyalty platform] | [e.g. Purchase event] | [e.g. user_id, order_value, product_ids] | [e.g. Award loyalty points] |
| [e.g. CRM] | [e.g. Form submission] | [e.g. user_id, preference_data] | [e.g. Update CRM contact record] |

---

## Technical Constraints

### Hard limits the copilot must respect
- [FILL IN: e.g. No sends between 10pm-8am local time — enforced by Quiet Hours setting]
- [FILL IN: e.g. Maximum 3 messages per user per week across all channels — Frequency Capping active]
- [FILL IN: e.g. EU users must only be targeted on EU datacenter instance]
- [FILL IN: e.g. All email sends must go via dedicated IP — shared IP not available]

### Known technical debt or limitations
- [FILL IN: e.g. User ID is not consistent between web and mobile — anonymous user merging not yet implemented]
- [FILL IN: e.g. Purchase events do not include product category — catalog lookup required]
- [FILL IN: e.g. Loyalty API has intermittent latency spikes — always use :cache_body in Connected Content]
