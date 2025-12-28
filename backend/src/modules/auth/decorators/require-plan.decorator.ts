import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '../../users/entities/user.entity';
import { REQUIRED_PLAN } from '../guards/subscription.guard';

export const RequirePlan = (plan: SubscriptionPlan) =>
  SetMetadata(REQUIRED_PLAN, plan);

