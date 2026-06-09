# Canvas Brief
> Define the Canvas you want to build here. The copilot will use this as the primary brief when asked to build a Canvas. Fill in the sections relevant to your use case and leave the rest blank.

---

## Canvas Name
[e.g. Aperol Spritz Season Launch — UK Push + Email]

## Objective
[What should this Canvas achieve? e.g. Drive recipe engagement and event RSVPs among Aperol Enthusiasts in the UK during summer season]

## Entry Trigger
[How do users enter? e.g. Scheduled — all qualifying users on campaign launch date / Action-based — on recipe_saved event / API-triggered]

## Entry Audience
[Which segment(s) should enter this Canvas? Reference segments from client-context.md or the live workspace]

- Primary segment: [e.g. AFFINITY__APERITIFS]
- Additional filters: [e.g. country_residence == uk, is_legal_drinking_age == true]
- Exclusions: [e.g. users who received an email in the last 7 days]

## Channels
[List the channels this Canvas should use and in what order]

- [ ] Email
- [ ] Push (iOS)
- [ ] Push (Android)
- [ ] In-app message
- [ ] Content card
- [ ] SMS (not available — see client-context.md)
- [ ] WhatsApp (not available — see client-context.md)

## Journey Structure
[Describe the steps and logic, e.g.]

1. Day 0 — Send email with hero recipe and event CTA
2. Day 3 — If email not opened: send push notification
3. Day 3 — If email opened but no event_rsvp: send follow-up email with urgency CTA
4. Day 7 — Exit all remaining users

## Message Content Direction
[What should the messages say? Brand tone, key offer, CTA direction]

- Brand: [e.g. Aperol]
- Tone: [e.g. Bright, social, occasion-led]
- Key message: [e.g. Summer is here — discover the perfect Aperol Spritz recipe and find your nearest event]
- Primary CTA: [e.g. View recipe / RSVP to event]
- Personalisation to use: [e.g. First name, favorite_brand, nearest event from Catalogs]

## Timing and Frequency
- Send time: [e.g. 11:00 in user's local time]
- Quiet hours: [e.g. No sends between 21:00–09:00]
- Re-entry: [e.g. Users cannot re-enter for 90 days]
- Frequency cap: [e.g. Respect global frequency cap — max 2 emails/week]

## Conversion Goals
[What counts as a success for this Canvas?]

- Primary: [e.g. event_rsvp fired within 7 days of entry]
- Secondary: [e.g. recipe_saved fired within 7 days of entry]

## Compliance Checklist
- [ ] is_legal_drinking_age == true included in entry criteria
- [ ] Responsible drinking footer included in all email steps
- [ ] Market filter applied (country_residence) if market-specific
- [ ] Frequency cap respected
- [ ] GDPR consent respected for EU users
