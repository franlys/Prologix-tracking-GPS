import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '../../users/entities/user.entity';

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

    const planHierarchy = {
      [SubscriptionPlan.BASIC]: 0,
      [SubscriptionPlan.PLUS]: 1,
      [SubscriptionPlan.PRO]: 2,
    };

    const userPlanLevel = planHierarchy[user.subscriptionPlan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel < requiredPlanLevel) {
      throw new ForbiddenException(
        `This feature requires ${requiredPlan} plan or higher`,
      );
    }

    return true;
  }
}
