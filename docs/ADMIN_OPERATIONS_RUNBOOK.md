# Admin Operations Runbook

This document is the beta operating procedure for `OnlyClaw` admins.

It covers the non-UI process that sits around the admin dashboard so moderation, creator approval, and incident response do not depend on memory or ad hoc judgment.

## Scope

Use this runbook for:

- manual admin account provisioning
- creator approval and restoration decisions
- moderation report intake and queue handling
- urgent safety or legal escalations
- audit-log expectations for sensitive admin actions

This runbook assumes the admin product surfaces in `/admin`, `/admin/reports`, `/admin/review`, `/admin/creators`, `/admin/users`, and `/admin/audit` are available and that `GET /api/health` is the primary readiness check.

## Beta Ownership

Before beta traffic is opened, assign named people for these roles:

- launch owner: final go/no-go approver for launch or rollback
- moderation owner: primary decision-maker for creator approval, suspensions, and report handling
- backup moderator: second operator for coverage when the moderation owner is unavailable
- engineering owner: handles app failures, auth issues, deployment issues, and data recovery coordination
- legal or policy escalation owner: receives urgent safety, abuse, DMCA, or jurisdiction-sensitive escalations

If one person fills multiple roles during beta, document that explicitly before launch.

## Admin Provisioning

Admin access must never come from public signup.

Provision admins with this workflow:

1. Engineering or the launch owner creates the account through the approved identity provider flow.
2. A second named approver confirms the person should receive `ADMIN` access.
3. The account is assigned the admin role manually in the backing system.
4. The new admin signs in and verifies `/admin` access.
5. A second operator verifies that a non-admin account still cannot access `/admin`.
6. The provisioning event is recorded in the internal operating log outside the app and, if done through the app later, must also appear in `/admin/audit`.

Minimum rules:

- keep the admin list intentionally short during beta
- do not share admin accounts
- remove or downgrade access immediately when a person no longer needs operational access
- review the admin roster before launch and after any staffing change

## Creator Approval SOP

Use `/admin/creators` for creator state changes and leave a written note for every action.

Approve a creator only when all of the following are true:

- identity and verification status are reviewed according to the current beta standard
- profile copy and pricing do not create obvious trust, fraud, or coercion concerns
- content category and public presentation match current policy expectations
- any open reports or prior moderation notes are understood
- the operator is comfortable making the account visible in public discovery

When approving:

1. Review the creator record and the latest audit notes.
2. Confirm there is no unresolved blocking report or policy concern.
3. Approve in `/admin/creators`.
4. Write a note that explains why approval is safe now.
5. If approval depends on a manual exception, mention the approver or policy owner in the note.

When suspending:

1. Confirm the risk or policy reason for removal.
2. Suspend through `/admin/creators`, `/admin/reports`, or `/admin/review`.
3. Write a note that explains the trigger, scope, and next expected step.
4. If the suspension came from a report, confirm the related report is updated appropriately.

When restoring:

1. Confirm the blocking issue is resolved.
2. Restore through `/admin/creators`.
3. Write a note that explains what changed and why restoration is safe.

## Report Intake And Queue Handling

Use `/admin/reports` as the primary intake queue and `/admin/review` as the content-focused follow-up queue.

Triage order:

1. critical severity reports
2. high severity reports
3. reviewed items waiting on follow-up
4. lower-risk open items

Handling rules:

- critical reports should receive same-day moderator review
- every state-changing action must include a written note
- if a post is removed, say why it was removed
- if a creator or user is suspended, say what triggered the action and what must happen next
- do not dismiss or resolve a report without enough context for another operator to understand the decision later

Suggested queue routine for beta:

1. Check `/api/health`.
2. Open `/admin`.
3. Review readiness warnings and urgent report counts.
4. Work `/admin/reports` from highest severity down.
5. Review `/admin/review` for content-specific follow-up.
6. Review `/admin/creators` for pending creator decisions.
7. Confirm recent actions and note quality in `/admin/audit`.

## Urgent Escalation Path

Escalate immediately when any of these appear:

- possible underage content or age-gating failure
- non-consensual, exploitative, or coercive sexual content
- credible threats, blackmail, or imminent personal safety concerns
- law-enforcement, court-order, or legal-preservation requests
- repeated payment abuse tied to account compromise or fraud
- a moderation failure that exposes already-removed content publicly

Escalation workflow:

1. Preserve the report, request ID, affected account IDs, URLs, and timestamps.
2. Restrict access first if leaving the content live would increase harm.
3. Notify the legal or policy escalation owner and the engineering owner.
4. Capture the decision path in the operator log and in `/admin/audit` where appropriate.
5. Do not reopen public access until the escalation owner signs off.

If the app itself is failing during an urgent case:

1. Capture the `x-request-id` from the failing request if present.
2. Check `GET /api/health`.
3. Pull matching structured logs.
4. Hand the incident to the engineering owner while moderation preserves the case context.

## Audit Logging Expectations

The audit trail in `/admin/audit` is the operator-facing record for sensitive admin activity.

Every sensitive action should answer three questions in the note:

- what happened
- why the action was taken
- what should happen next

Minimum note standard:

- do not leave notes blank for state-changing moderation actions
- do not use vague notes like `handled`, `reviewed`, or `done`
- mention whether the action is temporary, final, or pending follow-up
- include escalation references when another owner or team was involved

Examples of acceptable notes:

- `Suspended creator after repeated coercive upsell reports. Awaiting policy-owner review before any restore decision.`
- `Removed reported post because it contained disallowed exploitative roleplay language. Report resolved and creator warned through follow-up review.`
- `Restored account after false-positive fraud review. No open reports remain and login access is safe to resume.`

## Shift Open And Close Checklist

At the start of an admin shift:

1. Check `GET /api/health`.
2. Review `/admin` for readiness warnings, urgent reports, and risky accounts.
3. Review `/admin/reports` for new critical or high-severity cases.
4. Review `/admin/creators` for pending approvals or restores.

At the end of an admin shift:

1. Confirm no critical report is left without an owner or note.
2. Confirm any urgent escalation has a named follow-up owner.
3. Review `/admin/audit` for note quality and missing context.
4. Hand off unresolved work to the next operator in the internal shift log.

## Launch-Day Minimum

Before beta launch, confirm all of the following are true:

- named owners exist for launch, moderation, engineering, and escalation
- the admin roster is reviewed and intentionally limited
- creator approval criteria are agreed on for beta
- report intake coverage is assigned
- urgent escalation contacts are documented outside the repo and known to the team
- operators know to use `/admin`, `/admin/audit`, `GET /api/health`, structured logs, and `x-request-id` together during incidents
