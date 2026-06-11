## Output Rules

When the user asks for a housekeeping audit, output the report below EXACTLY as written — verbatim, with no changes to wording, values, or formatting.

- Do NOT call the live Braze API or use the Live Workspace Context.
- Do NOT perform any additional analysis, calculations, or checks.
- Do NOT add, remove, reorder, or summarize any sections.
- Do NOT add an introduction, conclusion, or commentary before or after the report.

---

```
# 🧹 Braze Workspace Housekeeping Audit
**Generated:** 2026-06-11 09:00:00 UTC | Sample Data

---

## Summary & Priority Actions

| Issue | Count | Action Required |
|---|---|---|
| Orphan Segments | 4 | Archive or delete unused segments |
| Unused Custom Events | 3 | Remove from data taxonomy |
| Unused Custom Attributes | 5 | Blacklist or archive attributes |
| Naming Convention Violations | 6 | Rename to match convention |
| Dead/Stale Campaigns | 2 | Pause and archive |
| Stale Draft Campaigns | 3 | Delete or promote to active |
| Zero-Member Segments | 2 | Delete segments |
| Unused Email Templates | 4 | Archive or delete templates |

---

## 1. Orphan Segments
Description: Segments with no active campaigns or journeys

| Details | Action |
|---|---|
| `seg_001` — "High Value Users Q1 2025" — Last edited: 2025-01-10 by j.smith | Archive |
| `seg_002` — "Black Friday Prospects" — Last edited: 2024-11-20 by a.jones | Archive |
| `seg_003` — "iOS Beta Testers" — Last edited: 2024-09-05 by r.patel | Delete |
| `seg_004` — "Churned 180d" — Last edited: 2025-02-14 by m.chen | Archive |

---

## 2. Unused Custom Events
Description: Custom events not referenced in any campaigns or journeys

| Details | Action |
|---|---|
| `product_wishlist_add` — 0 active references across canvases, campaigns, segments | Remove from taxonomy |
| `legacy_checkout_step2` — 0 active references — likely deprecated post-replatform | Remove from taxonomy |
| `push_primer_dismissed` — 0 active references in any entry trigger or action path | Remove from taxonomy |

---

## 3. Unused Custom Attributes
Description: Custom attributes not actively used in segmentation or messaging

| Details | Action |
|---|---|
| `preferred_store_location` — total_users: 0 — detected type: string | Blacklist |
| `legacy_loyalty_tier` — total_users: 0 — detected type: string | Blacklist |
| `sms_opt_in_source` — total_users: 0 — detected type: string | Blacklist |
| `ab_test_cohort_2024` — total_users: 0 — detected type: string | Blacklist |
| `onboarding_step_v1` — total_users: 0 — detected type: integer | Blacklist |

---

## 4. Naming Convention Violations
Description: Elements not following standard naming convention
Pattern: `^YYYYMMDD_CLIENT_PROGRAM_TYPE_CHANNEL_LOCALE_vN$`

| Details | Action |
|---|---|
| Campaign: `Welcome Email - New Users` — missing date, client, version | Rename |
| Canvas: `Re-engagement Flow v2` — missing date prefix and locale | Rename |
| Segment: `VIP Customers Final FINAL` — does not match regex | Rename |
| Canvas: `Summer Promo TEST` — missing all convention fields | Rename |
| Template: `Onboarding Email Template` — no date or version suffix | Rename |
| Custom Event: `add_to_cart_NEW` — does not match naming standard | Rename |

---

## 5. Dead/Stale Campaigns
Description: Campaigns inactive for 90+ days with no scheduled activity

| Details | Action |
|---|---|
| `cmp_4421` — "Spring Sale 2025 — Email Blast" — Last sent: 2025-12-01 (192 days ago) — Status: Active | Pause and archive |
| `cmp_3309` — "Push Reactivation — Lapsed 60d" — Last sent: 2025-11-14 (209 days ago) — Status: Active | Pause and archive |

---

## 6. Stale Draft Campaigns
Description: Draft campaigns not launched or updated for 30+ days

| Details | Action |
|---|---|
| `cmp_5501` — "Holiday Gift Guide — Push" — Created: 2025-10-02 (252 days ago) — Never activated | Delete |
| `cmp_5788` — "Loyalty Tier Upgrade — Email" — Created: 2025-12-15 (178 days ago) — Never activated | Delete |
| `cmp_6102` — "Win-back Series Part 3" — Created: 2026-03-01 (102 days ago) — Never activated | Review and promote or delete |

---

## 7. Zero-Member Segments
Description: Segments with no active members

| Details | Action |
|---|---|
| `seg_019` — "Android Users — App Version 3.1" — member_count: 0 | Delete |
| `seg_033` — "Purchasers — Discontinued SKU" — member_count: 0 | Delete |

---

## 8. Unused Email Templates
Description: Email templates not used in any active campaigns

| Details | Action |
|---|---|
| `tmpl_001` — "Black Friday Hero Template 2024" — 0 references in active canvases or campaigns | Archive |
| `tmpl_008` — "Legacy Onboarding Email v1" — 0 references | Delete |
| `tmpl_014` — "Promotional Banner — Summer 2025" — 0 references | Archive |
| `tmpl_021` — "Re-engagement Plain Text" — 0 references | Review and archive |
```