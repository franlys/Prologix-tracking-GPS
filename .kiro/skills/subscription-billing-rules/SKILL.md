---
name: subscription-billing-rules
description: Documents the business rules for GPS subscription billing in this project. Use when working with subscription plans, active device counting, billing thresholds, payment logic, plan enforcement, or when user asks about "how billing works", "subscription model", "free tier", "active GPS limit", "monthly fee", "plan upgrade", or "device quota".
metadata:
  author: Prologix GPS
  version: 1.0.0
---

# Subscription Billing Rules

## Business Model

Clients can connect GPS devices for free up to a defined threshold. Once they exceed that threshold, a monthly subscription is charged to view all active GPS devices.

## Core Rules

1. Each user account has a `subscriptionPlan` (stored in users table).
2. Active devices = devices that have reported a position in the last 30 days.
3. Free tier allows up to N active devices (configured per plan).
4. When active devices exceed the free tier limit, the `subscription.guard.ts` blocks access to tracking features until a paid plan is active.

## Plan Enforcement

The `SubscriptionGuard` in `backend/src/modules/auth/guards/subscription.guard.ts` enforces plan limits. Use the `@RequirePlan()` decorator on controller endpoints that require a paid subscription.

```ts
@Get('positions')
@RequirePlan('basic')  // blocks free users over limit
async getPositions() { ... }
```

## Database Schema

Relevant tables:
- `users` — has `subscription_plan`, `subscription_status`, `subscription_expires_at`
- `devices` — has `user_id`, `last_position_at` (used to determine active status)

## Adding New Plan Tiers

1. Add plan name to the plan enum in the users entity
2. Update `SubscriptionGuard` to handle the new tier's limits
3. Update frontend plan selection UI
4. Document the new limits here

## Important Notes

- Never hardcode device limits in controllers — always read from plan config
- A device is "active" based on `last_position_at`, not just whether it's registered
- Subscription expiry should be checked on every protected request, not just login
