# Creator UX Checklist

This document captures the follow-up work from a smoke test and UX/readability review of the creator studio experience.

It is intentionally scoped as a working checklist so we can approve items and complete them one by one.

## Smoke Test Summary

Pages loaded successfully during the smoke test:

- `/creator`
- `/creator/posts`
- `/creator/posts/new`
- `/creator/messages`
- `/creator/subscribers`
- `/creator/pricing`
- `/creator/compliance`
- `/creator/settings`

No blocking runtime failures were observed during the read-only pass, but several workflow, mobile, information-architecture, and action-honesty issues were identified.

## Priority Order

Start with the items that most improve creator trust and task completion:

1. reduce the oversized shared creator shell on subpages
2. make launch-stage actions feel honest instead of half-live
3. move the highest-value creator workflows ahead of studio presentation copy
4. simplify workflow cards so publishing, messaging, pricing, and subscriber decisions scan faster
5. fix mobile navigation and reachability across the 8-tab creator surface

## Checklist

### 1. Shared Creator Shell And Mobile Navigation

- [x] Reduce the height of the shared creator shell on subpages.
- [x] Keep the larger branded creator hero treatment only where it meaningfully helps orientation.
- [x] Make sure the first page-specific action appears much earlier on small screens.
- [x] Reassess whether shell-level metrics need to stay visible on every creator page.
- [ ] Verify that the fixed mobile nav remains discoverable and usable with 8 creator destinations.

### 2. Copy Density And Launch Honesty

- [x] Cut page descriptions and helper copy down to the shortest version that still explains the workflow.
- [x] Remove premium-sounding presentation copy that does not help a creator complete the next task.
- [x] Make disabled or unfinished actions read as intentionally unavailable, not broken.
- [x] Standardize how the studio explains mock-safe, placeholder, preview, and launch-slice limitations.
- [x] Reduce repeated explanatory copy inside sidebars, status cards, and guidance panels.

### 3. Dashboard And Studio Hierarchy

- [x] Rework `/creator` so the most urgent creator actions appear before profile showcase content.
- [x] Prioritize unread conversations, renewal risk, post cadence, pricing actions, and compliance blockers.
- [x] Reduce equal weight between audience pulse, profile summary, recent posts, and conversation cards.
- [x] Make the dashboard feel like a creator control room, not a premium presentation page.
- [x] Move lower-priority guidance and secondary links lower once the main action lane is clear.

### 4. Publishing Workflow Clarity

- [x] Make the `/creator/posts/new` composer easier to scan from top to bottom.
- [x] Clarify the difference between public teaser content and subscriber-only drops at a glance.
- [x] Make media selection, preview, scheduling, and visibility choices feel like one coherent publishing flow.
- [x] Make it obvious which actions are unavailable in this environment and what is still safe to test.
- [x] Re-check whether the composer feels practical on mobile, especially for file input and preview review.

### 5. Posts Management Scanability

- [x] Make published, scheduled, and draft states easier to distinguish quickly.
- [x] Reduce visual competition between post imagery, engagement context, revenue context, and action buttons.
- [x] Ensure the most likely next step is obvious for each post state.
- [x] Reassess whether `Edit post`, `Duplicate`, and `Archive` feel too live if they are not actually wired.
- [x] Make sure posts management reads like an operational publishing surface instead of a gallery.

### 6. Messages And Paid-Drop Workflow Clarity

- [x] Prioritize unread threads, subscriber state, and paid-drop opportunity more clearly in `/creator/messages`.
- [x] Make inbox cards easy to scan without overloading them with status badges and pricing hints.
- [x] Clarify what the paid-message composer can currently validate versus what remains disabled.
- [x] Make the featured conversation sidebar feel supportive instead of redundant next to the thread list.
- [x] Acknowledge clearly that creator messaging is inbox/composer-only right now because thread detail is not part of this launch slice.

### 7. Subscriber Management And CRM Usefulness

- [x] Make VIP, active, and at-risk subscriber states easy to recognize on mobile.
- [x] Reduce visual competition between notes, lifetime spend, membership status, and disabled CRM actions.
- [x] Ensure the page highlights the most valuable next step for retention and outreach.
- [x] Make disabled `Message` and `Tag` controls feel intentionally unavailable rather than unfinished.
- [x] Re-check whether subscriber cards stay readable when stacked on small screens.

### 8. Pricing Controls And Monetization Clarity

- [x] Make pricing controls feel like creator business tools instead of a preview toy.
- [x] Clarify the relationship between monthly membership pricing, locked-message defaults, and bundle defaults.
- [x] Reduce friction in the slider/input flow so pricing changes scan and update predictably.
- [x] Ensure disabled save/reset actions feel honest and do not undermine trust in the rest of the page.
- [x] Make benchmark guidance and preview cards useful without overpowering the core pricing decisions.

### 9. Settings And Public-Page Alignment

- [x] Reassess whether `/creator/settings` currently feels like a real profile editor or a static mock form.
- [x] Make it clearer which fields shape the public creator page versus internal compliance or operational metadata.
- [x] Clarify the relationship between settings, pricing, compliance, and the public-facing creator identity.
- [x] Ensure `Save profile` and `Preview public page` set correct expectations for what is and is not wired yet.
- [x] Keep the settings page lightweight enough that it feels actionable instead of form-heavy and speculative.

### 10. Compliance And Trust Workflow Clarity

- [x] Distinguish live creator trust requirements from placeholder compliance scaffolding.
- [x] Make approval, verification, adult-content access, and rights-management states easier to interpret quickly.
- [x] Reduce repeated policy/process explanations that still do not tell the creator what to do next.
- [x] Ensure public legal/reporting links feel connected to the creator workflow instead of bolted on.
- [x] Reassess whether self-attested adult gating and unfinished rights flows create trust risk in the current UI.

### 11. Status, Count, And Terminology Consistency

- [x] Audit creator labels like `VIP`, `Unread`, `Lapsed`, `At risk`, `Subscribers only`, `Public teaser`, `Approval`, and `Verification`.
- [x] Remove status combinations that say nearly the same thing in different words.
- [x] Make sure shell metrics, page metrics, and card-level badges answer distinct creator questions.
- [x] Prefer creator-friendly language over internal or scaffolding-heavy terminology where possible.
- [x] Verify that counts and statuses stay consistent across overview, messages, subscribers, pricing, settings, and compliance.

### 12. Empty, Loading, Error, And Deep-Link States

- [x] Add creator-specific `loading`, `error`, and `not-found` handling where the route group currently falls back to generic behavior.
- [x] Re-test the creator studio with empty post, empty inbox, and empty subscriber states.
- [x] Check whether missing avatars, cover images, and partial creator or fan data degrade gracefully.
- [x] Reassess the creator experience around deep links, especially since there is no message-thread detail route today.
- [x] Make sure demo-data and placeholder states do not hide the biggest launch-edge cases creators will feel first.

## Execution Status

1. Shared Creator Shell And Mobile Navigation: in progress
   Mobile nav validation across all 8 destinations still needs a final pass.
2. Copy Density And Launch Honesty: complete
   Creator-facing preview/dev wording was rewritten across the main creator surfaces.
3. Dashboard And Studio Hierarchy: complete
   The creator dashboard now reads as an action-first workspace instead of a presentation surface.
4. Publishing Workflow Clarity: in progress
   Text-based draft saving, publishing, and scheduling now work in beta, while media uploads are clearly deferred until a real pipeline exists.
5. Posts Management Scanability: in progress
   The posts manager now reads from real creator post data, but edit, duplicate, and archive are still not active.
6. Messages And Paid-Drop Workflow Clarity: in progress
   Creator replies and text-only paid drops are now live from the inbox, while media attachments and template saving are still deferred.
7. Subscriber Management And CRM Usefulness: in progress
   The subscriber roster now reads from real subscription data and `Message` routes into the live inbox flow, while tagging is still deferred.
8. Pricing Controls And Monetization Clarity: in progress
   Membership price now saves in beta, while locked-message, bundle, and trial controls remain draft-only until those workflows are wired.
9. Settings And Public-Page Alignment: in progress
   Core profile and compliance fields now save in beta, while preview plus subscriber-expectation fields still need dedicated support.
10. Compliance And Trust Workflow Clarity: in progress
   Compliance wording is clearer and disclosure metadata now saves from settings, but legal text and stronger verification processes are still pending.
11. Status, Count, And Terminology Consistency: in progress
   Main terminology is cleaner, but it should be re-checked after the remaining real-data creator workflows are finished.
12. Empty, Loading, Error, And Deep-Link States: in progress
   Creator not-found and data-edge handling improved, but these states should be re-tested once the remaining creator flows are live.

## Notes

- This checklist is based on a read-only smoke test and UX pass.
- No posts were published, no messages were sent, and no pricing/settings/compliance changes were submitted during testing.
- Work should be done iteratively and re-tested after each major change group.
