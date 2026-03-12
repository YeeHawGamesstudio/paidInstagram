# OnlyClaw Foundation Summary
[PHASE 0]
## What Was Set Up

We created the initial production-shaped scaffold for `OnlyClaw` as a mobile-first premium web app using:

- `Next.js` with the App Router
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`-compatible component foundation
- `Prisma`
- `PostgreSQL`
- `Zod`
- `React Hook Form`

## Folder Structure

The project was organized with a clean `src` layout:

- `src/app/(public)` for the public-facing surface
- `src/app/(fan)` for fan-only app structure
- `src/app/(creator)` for creator-only app structure
- `src/app/(admin)` for admin-only app structure
- `src/components/ui` for reusable UI primitives
- `src/components/layouts` and `src/components/shared` for shared shells
- `src/lib/auth`, `src/lib/config`, `src/lib/design`, and `src/lib/prisma` for infrastructure and shared logic
- `src/schemas` for Zod schemas
- `src/features` reserved for future domain modules
- `prisma` for database schema and seed setup

## Architecture Decisions

- Route groups were set up to separate `public`, `fan`, `creator`, and `admin` surfaces early.
- The app was prepared for role-based auth without implementing the auth system yet.
- Shared design, validation, Prisma, and utility code were separated into stable layers so feature work can build on top cleanly.
- We intentionally did not build full feature pages yet, only the foundation and placeholders.

## Design System Foundation

A dark premium visual foundation was created with:

- global theme tokens in `src/app/globals.css`
- app-wide typography and metadata in `src/app/layout.tsx`
- reusable UI primitives such as `Button`, `Card`, `Input`, `Label`, and `Form`
- role-aware shell layouts for future fan, creator, and admin experiences

## Prisma and Database Prep

Prisma was configured for PostgreSQL using the current Prisma 7 setup:

- `prisma/schema.prisma`
- `prisma.config.ts`
- `src/lib/prisma/client.ts`
- `prisma/seed.ts`

Initial models were prepared for:

- `User`
- `FanProfile`
- `CreatorProfile`
- `UserRole` enum with `FAN`, `CREATOR`, and `ADMIN`

Seed data was also prepared for:

- one admin user
- one fan user
- one creator user

## Routes Created

Minimal placeholder routes were added for:

- `/`
- `/fan`
- `/creator`
- `/admin`

These are structural placeholders only, not full feature implementations.

## Validation and Forms

The project was prepared for typed validation and form handling with:

- Zod schemas in `src/schemas`
- React Hook Form foundation in `src/components/ui/form.tsx`

## Verification

The scaffold was verified successfully with:

- `npm run prisma:generate`
- `npm run lint`
- `npm run build`

## Important Notes

- We stayed within scope and did not add extra product features.
- Auth was only prepared structurally, not implemented.
- The project is ready for the next phase: actual auth, protected routes, and feature development on top of the scaffold.
[PHASE 1]
## Prisma Expansion Summary

We expanded the database from a small starter setup into a more realistic `OnlyClaw` content platform schema.

The Prisma schema now supports:

- users with `fan`, `creator`, and `admin` roles
- a general `Profile` model for user identity data
- a `CreatorProfile` model for creator-specific settings and approval state
- subscriptions between fans and creators
- public posts and subscriber-only posts
- media attached to posts or messages
- fan and creator conversations
- locked paid messages and paid media unlocks
- mock transactions for subscriptions and unlock purchases
- reports, creator applications, and admin action logs

The seed script was also upgraded so local development has realistic demo data instead of only one fan and one creator.

It now seeds:

- 3 demo AI creators
- example fans
- public teaser posts
- subscriber-only posts
- example conversations
- locked paid messages
- example subscriptions
- mock unlock and subscription transactions
- moderation and admin examples

This gives the project a much better foundation for building the real feed, subscriptions, inbox, unlock flow, and admin tools next.
