import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '../../subscriptions/entities/subscription.entity';

export const REQUIRED_PLAN = 'requiredPlan';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<SubscriptionPlan>(
      REQUIRED_PLAN,
      context.getHandler(),
    );

    if (!requiredPlan) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Updated plan hierarchy: FREE < BASICO < PROFESIONAL < EMPRESARIAL
    const planHierarchy = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.BASICO]: 1,
      [SubscriptionPlan.PROFESIONAL]: 2,
      [SubscriptionPlan.EMPRESARIAL]: 3,
    };

    const userPlanLevel = planHierarchy[user.subscriptionPlan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel === undefined || userPlanLevel < requiredPlanLevel) {
      throw new ForbiddenException(
        `This feature requires ${requiredPlan} plan or higher. Your current plan: ${user.subscriptionPlan}`,
      );
    }

    return true;
  }
}
