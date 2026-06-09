# Braze Delivery Best Practice Playbook
> This file encodes our firm's delivery IP. The copilot reasons from this as its baseline on every engagement.
> Platform specialists: fill in each section with your real-world knowledge before the hackathon.

---

## Canvas Architecture

### Structural principles
- Every Canvas must have a clear single objective. If it tries to do two things, split it into two Canvases.
- Entry criteria should be as tight as possible. Broad entry = diluted performance and noisy reporting.
- Always include a control group (minimum 10%) on any Canvas where you are testing a hypothesis.
- Maximum recommended Canvas depth before a user reaches an exit or conversion step: 7 steps.
- Use Action Paths over Decision Splits wherever possible — they wait for behaviour rather than evaluating a static condition.

### Step sequencing rules
- Never send more than one message on the same day across channels without a deliberate cross-channel strategy.
- Email → wait minimum 2 hours → push is acceptable. Push → email same day is not.
- Always add a delay step after entry before the first message. Minimum 5 minutes for triggered Canvases, 1 hour for scheduled.
- Winning variant promotion should only be enabled when statistical significance is confirmed — not on a timer.

### Exit and re-entry
- Set explicit exit criteria on every Canvas. A Canvas with no exit criteria will hold users indefinitely.
- Re-entry should be disabled by default. Enable only with explicit client sign-off and a documented reason.
- Exception: recurring canvases (weekly digest, loyalty update) — re-entry is expected and required.

---

## Segmentation

### Hygiene rules
- [FILL IN: Your firm's rules for segment naming conventions]
- [FILL IN: Your firm's approach to segment archiving and cleanup]
- Always enable analytics tracking on any segment used in a recurring Canvas.
- Never use a segment with fewer than 100 users in production. Use a test segment for validation.
- Segments that reference custom events must be validated against the event taxonomy before use.

### Common mistakes to flag
- Using AND logic where OR is needed (over-restriction)
- Stacking too many filters — beyond 5 filters, validate the estimated audience size is realistic
- Using a segment that includes opted-out users without a subscription state filter
- [FILL IN: Other common mistakes your team sees on client accounts]

---

## Liquid Personalisation

### Standards
- All Liquid variables must have a default value. No exceptions. `{{ custom_attribute.${first_name} | default: 'there' }}`
- Test every Liquid block with a user who has null values for every referenced attribute.
- Nested if/else blocks beyond 3 levels deep should be refactored into a content block.
- Connected Content calls must have a `:save` tag and a timeout parameter. Default timeout: 3 seconds.
- Never reference an attribute in Liquid that has not been confirmed to exist in the client's data model.

### Patterns we use
- [FILL IN: Your firm's preferred Liquid patterns for loyalty tiers]
- [FILL IN: Your firm's preferred Liquid patterns for product recommendations]
- [FILL IN: Your firm's preferred Liquid patterns for localisation]

---

## Channel Strategy

### Email
- Subject line length: 40-50 characters for mobile optimisation.
- Always include a plain text version.
- Preview text must be set — never leave it blank.
- Unsubscribe link must be visible in the body, not just the footer header.
- [FILL IN: Your firm's deliverability standards and IP warming rules]

### Push
- Message copy: maximum 60 characters on iOS for guaranteed display without truncation.
- Always set a TTL (time to live). Default recommendation: 24 hours for promotional, 1 hour for transactional.
- Never send push between 9pm and 8am local time without explicit user opt-in for night delivery.

### In-App Message
- Use in-app messages to complement, not duplicate, push or email content.
- Always set display duration. Never use persistent in-app messages without a dismiss mechanism.
- [FILL IN: Your firm's preferred IAM templates and when to use each]

### Content Cards
- Use for persistent offers, loyalty balances, and recommendations — not for time-sensitive messages.
- Always set an expiration. Default: 30 days unless client requirement differs.

---

## Campaign Configuration

### Naming conventions
- [FILL IN: Your firm's standard naming convention — e.g. DATE_CLIENT_PROGRAM_TYPE_CHANNEL_LOCALE_VERSION]
- Consistency in naming is non-negotiable. The copilot should flag any campaign or Canvas that does not follow the convention.

### Tagging standards
- [FILL IN: Your firm's required tags — e.g. tag.env, tag.channel, tag.program, tag.team]
- Every production asset must have at minimum: environment tag, channel tag, team tag.

### QA checklist before any send
- [ ] Liquid tested with null attribute values
- [ ] Segment validated and audience size confirmed
- [ ] Send time reviewed against user timezone settings
- [ ] Control group configured
- [ ] Conversion tracking event confirmed
- [ ] Unsubscribe / opt-out path tested
- [ ] [FILL IN: Any additional QA steps your firm requires]

---

## Reporting and Analytics

### What to review at 24h post-send
- [FILL IN: Your firm's standard 24h review metrics and thresholds]

### What to review at 7 days
- [FILL IN: Your firm's standard 7-day review metrics and thresholds]

### Red flags to escalate immediately
- Unsubscribe rate above 0.5% on any single send
- Bounce rate above 2%
- Delivery rate below 95%
- [FILL IN: Any additional red flags your firm monitors]

---

## Anti-patterns — What We Always Flag

These are patterns the copilot should proactively identify and flag on any client account:

1. Canvases with no exit criteria
2. Segments with analytics tracking disabled used in recurring Canvases
3. Liquid variables without default values
4. Campaigns or Canvases with no tags
5. Active Canvases that have not been edited or reviewed in 90+ days
6. Duplicate or near-duplicate segment definitions
7. Email campaigns with no plain text version
8. Push campaigns with no TTL set
9. [FILL IN: Additional anti-patterns your team commonly encounters]
