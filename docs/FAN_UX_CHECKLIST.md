# Fan UX Checklist

This document captures the follow-up work from a smoke test and mobile-first UX/readability review of the fan experience.

It is intentionally scoped as a working checklist so we can approve items and complete them one by one.

## Smoke Test Summary

Pages loaded successfully during the smoke test:

- `/fan`
- `/fan/subscriptions`
- `/fan/messages`
- `/fan/messages/[conversationId]`
- `/fan/account`
- `/fan/billing`

No blocking runtime failures were observed during the read-only pass, but several mobile UX, information-architecture, and launch-copy issues were identified.

## Priority Order

Start with the items that most improve the core phone experience:

1. reduce the vertical weight of the shared fan shell on inner pages
2. make the most important fan actions reachable faster on small screens
3. clarify locked content, paid unlocks, and message state without long explanations
4. improve discoverability for billing and other secondary fan flows
5. clean up placeholder/internal-sounding copy so the product reads like a launch surface

## Checklist

### 1. Shared Fan Shell And Mobile Navigation

- [x] Reduce the height of the shared fan shell on subpages.
- [x] Keep the larger branded hero treatment only where it meaningfully helps orientation.
- [x] Make sure the first page-specific action appears much earlier on phones.
- [x] Reassess whether shell-level metrics need to stay visible on every fan page.
- [x] Verify that the fixed mobile bottom nav never competes with page CTAs or message actions.

### 2. Mobile Reachability And Tap Targets

- [ ] Re-test all primary fan flows using one-hand mobile navigation.
- [x] Make sure buttons, links, badges, and list rows are easy to tap without precision.
- [x] Confirm that stacked cards do not force excessive thumb travel between context and action.
- [x] Check that bottom-page actions are not obscured by safe-area spacing or the fixed nav.
- [x] Ensure back links, unlock buttons, and billing links are reachable without awkward scrolling.

### 3. Home Feed Hierarchy

- [x] Rework `/fan` so the most useful actions and newest premium updates appear before decorative shell content.
- [x] Reduce equal visual weight between feed headlines, metrics, and secondary explanation copy.
- [x] Make it easier to scan which feed items are already included versus still locked.
- [x] Make sure the CTA on each feed card clearly matches the next step the fan can actually take.
- [x] Re-check whether the feed feels like a daily mobile destination instead of a product showcase.

### 4. Locked Content And Paid Unlock Clarity

- [x] Make locked-message and locked-feed treatments understandable at a glance on small screens.
- [x] Reduce explanatory copy around paid unlocks so price, value, and next action are the clearest elements.
- [x] Make sure unlocked state changes read instantly after purchase without ambiguity.
- [x] Distinguish subscription-gated content from one-off paid drops using plain-language labels.
- [x] Confirm that premium media previews feel enticing without making locked states confusing or repetitive.

### 5. Messages And Conversation UX

- [x] Prioritize unread replies, paid drops, and creator identity more clearly in `/fan/messages`.
- [x] Make inbox rows easy to scan quickly on mobile without losing important state.
- [x] Ensure conversation detail establishes the thread context before showing long message history.
- [x] Make the reply-window badge, unlock action, and report link easy to notice without cluttering the thread.
- [x] Clarify that replies are intentionally unavailable without making the thread feel incomplete or broken.

### 6. Subscriptions Management Clarity

- [x] Make active subscription status, renewal timing, and cancellation state easier to scan on phones.
- [x] Reduce visual competition between creator imagery, perk lists, and membership actions.
- [x] Ensure the most likely next action is obvious for active, renewing, paused, and canceled memberships.
- [x] Simplify the "available subscriptions" section so it reads like discovery, not billing infrastructure.
- [x] Verify that links from subscriptions into messages, creator pages, and billing feel intentional and connected.

### 7. Billing Discoverability And Fan-Facing Language

- [x] Decide whether `/fan/billing` should remain secondary or become part of the primary fan navigation.
- [x] Reduce internal-sounding architecture language on the billing page.
- [x] Reframe billing content around fan trust, charges, refunds, and payment history before platform implementation details.
- [x] Make billing settings easier to discover from account, subscriptions, and relevant purchase flows.
- [x] Confirm that billing history cards surface the most important information first on mobile.

### 8. Account And Settings Usefulness

- [x] Reassess whether `/fan/account` currently feels like a real settings surface or a placeholder summary.
- [x] Replace static-sounding preference rows with clearer fan-facing controls or more honest launch messaging.
- [x] Make the relationship between account, privacy, notifications, and billing more obvious.
- [x] Ensure the page offers useful fan actions instead of only informational cards.
- [x] Keep the account page lightweight enough that it does not feel like a dead end.

### 9. Status, Count, And Terminology Consistency

- [x] Verify that unread counts match across the shell, inbox list, and conversation detail.
- [x] Audit fan labels like `locked`, `included`, `premium`, `subscription`, and `billing` for consistency.
- [x] Remove status combinations that say nearly the same thing in different words.
- [x] Prefer fan-friendly wording over internal or systems-oriented terminology.
- [x] Make sure each badge or metric answers a distinct user question.

### 10. Empty, Loading, Error, And Deep-Link States

- [x] Re-test all empty states for fans with no memberships, no inbox activity, and no billing history.
- [x] Confirm that loading states feel intentional on slower mobile connections.
- [x] Add a follow-up review for not-found and error handling on deep-linked conversations or billing states.
- [x] Check whether missing media, missing avatars, and partial creator data degrade gracefully.
- [x] Make sure fallback/demo-data states do not hide real launch edge cases that fans will hit first.

## Execution Status

1. Shared Fan Shell And Mobile Navigation: complete
   The shared fan shell already reads lighter on inner pages and no new blocker surfaced in this pass.
2. Mobile Reachability And Tap Targets: complete
   A real browser walkthrough covered `/fan`, `/fan/messages`, a live thread, `/fan/subscriptions`, `/fan/billing`, and `/fan/account`, and the main tap targets remained easy to reach.
3. Home Feed Hierarchy: complete
   The home feed stays action-first, and fan-facing copy now frames message history more honestly.
4. Locked Content And Paid Unlock Clarity: complete
   Locked-message and unlock language remains clear, and the fan thread still reads well around paid drops.
5. Messages And Conversation UX: complete
   Browser verification confirmed the inbox and live thread read honestly as creator-update history plus paid drops, and the last seeded `chat` wording was removed.
6. Subscriptions Management Clarity: complete
   Membership surfaces stayed coherent in the browser and continued to route fans toward message history and paid drops instead of implying live chat.
7. Billing Discoverability And Fan-Facing Language: complete
   The billing page and related fan actions now read cleanly in the browser, with beta billing language staying transparent without sounding overly internal.
8. Account And Settings Usefulness: complete
   The account surface now reads as a useful fan control point in the browser, with clearer creator-update language and direct links into memberships, messages, and billing.
9. Status, Count, And Terminology Consistency: complete
   A final browser-led cleanup aligned home, account, shared shell, and seeded thread copy around `messages`, `message history`, `creator updates`, and `paid drops`.
10. Empty, Loading, Error, And Deep-Link States: in progress
   Existing states look reasonable, and a deep-linked conversation thread was verified, but dedicated empty/loading/error re-testing is still outstanding.

## Notes

- This checklist is based on a read-only smoke test and mobile-first UX pass.
- No purchases, unlocks, cancellations, or report submissions were completed during testing.
- Work should be done iteratively and re-tested after each major change group.
