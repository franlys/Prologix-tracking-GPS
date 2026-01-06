import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '../../subscriptions/entities/subscription.entity';
import { REQUIRED_PLAN } from '../guards/subscription.guard';

export const RequirePlan = (plan: SubscriptionPlan) =>
  SetMetadata(REQUIRED_PLAN, plan);

