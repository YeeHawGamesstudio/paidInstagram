# Admin Dashboard Checklist

This document captures the follow-up work from a smoke test and UX/readability review of the admin dashboard.

It is intentionally scoped as a working checklist so we can approve items and complete them one by one.

## Smoke Test Summary

Pages loaded successfully during the smoke test:

- `/admin`
- `/admin/users`
- `/admin/creators`
- `/admin/reports`
- `/admin/review`
- `/admin/audit`

No blocking runtime failures were observed during the read-only pass, but several UX and information-architecture issues were identified.

## Priority Order

Start with the items that most improve scanability and operator focus:

1. reduce the oversized shared admin header on subpages
2. cut page intro copy and long helper text
3. simplify dashboard cards so urgent/actionable work appears first
4. make moderation actions more obvious than surrounding narrative text
5. clean up queue logic so resolved items do not look actionable

## Checklist

### 1. Shared Admin Shell

- [x] Reduce the height of the shared admin shell on subpages.
- [x] Keep the large hero treatment only on `/admin`.
- [x] Replace subpage hero sections with a more compact title + nav pattern.
- [x] Reassess whether the top metrics strip belongs on every admin page.
- [x] Make sure the first actionable content appears much earlier in the viewport.

### 2. Copy Density And Readability

- [x] Cut each page description down to one short sentence max.
- [x] Remove redundant helper text that repeats what the section title already says.
- [x] Shorten long action-state paragraphs into compact, scannable summaries.
- [x] Reduce repeated explanatory copy inside cards and side panels.
- [x] Improve chunking so operators can scan labels, states, and actions without reading full paragraphs.

### 3. Dashboard Information Hierarchy

- [x] Rework `/admin` so urgent exceptions appear before general platform summaries.
- [x] Prioritize failing readiness checks, urgent reports, pending creator decisions, and blocked accounts.
- [x] Move secondary guidance like runbook/support tips lower or behind a smaller treatment.
- [x] Reduce the number of equally weighted cards shown at once.
- [x] Make the dashboard feel like an operations surface, not a presentation page.

### 4. Record Card Simplification

- [x] Convert large multi-paragraph moderation cards into denser operational layouts.
- [x] Show only the most important facts by default.
- [x] Demote note history and lower-signal detail into expandable or secondary sections.
- [x] Reduce duplicate labels like `Action state`, `Latest moderation state`, and `Current access state` when they overlap.
- [x] Create a clearer visual order: item identity, current status, next step, actions, then history.

### 5. Action Clarity

- [x] Make the primary action the most visually prominent control on each actionable record.
- [x] Reduce visual competition between explanation text and moderation controls.
- [x] Standardize button hierarchy across creators, reports, users, and review.
- [x] Ensure destructive or high-impact actions are clearly distinguished.
- [x] Keep audit/history links available without letting them dominate the task flow.

### 6. Queue Logic And Status Accuracy

- [x] Fix reports and review queues so resolved items do not appear as if they still need moderation.
- [x] Add clear filters for `Open`, `Needs review`, `Resolved`, and `Dismissed` where relevant.
- [x] Make queue counts match the visible list state.
- [x] Clarify whether a page is showing an active queue or historical activity.
- [x] Prevent contradictory signals like zero open items while still rendering a case inside a "requires moderation" view.

### 7. Badge And Status Cleanup

- [x] Audit all badges across dashboard, creators, users, reports, review, and audit.
- [x] Remove redundant status combinations that add noise without adding meaning.
- [x] Standardize status terminology across admin pages.
- [x] Prefer plain-language labels over internal-sounding labels where possible.
- [x] Make sure each badge answers a distinct operator question.

### 8. Audit Log Quality

- [x] Reduce repetitive low-signal audit entries.
- [x] Decide whether empty-note actions should be hidden, grouped, or visually de-emphasized.
- [x] Improve note quality so the log reads as a trustworthy operational record.
- [x] Make recent important actions easier to distinguish from routine noise.
- [x] Consider adding better grouping or filtering once the visual density is reduced.

### 9. Visual Readability

- [x] Revisit body text contrast in dense admin sections.
- [x] Tighten card layouts so they read faster without feeling cramped.
- [x] Reduce long line lengths in explanatory text blocks.
- [x] Use spacing and typography to separate primary information from supporting detail.
- [x] Re-check readability after copy reduction instead of only adjusting colors.

### 10. Mobile Follow-Up

- [x] Re-test the admin dashboard at mobile widths after the density cleanup.
- [x] Verify that header/nav patterns do not consume too much vertical space on small screens.
- [x] Confirm that record cards remain readable when stacked.
- [x] Confirm that filters and actions remain reachable without excessive scrolling.

## Notes

- This checklist is based on a read-only smoke test and UX pass.
- No moderation actions were submitted during testing.
- Work should be done iteratively and re-tested after each major change group.
