import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../services/subscriptions.service';

export enum LimitType {
  DEVICE = 'DEVICE',
  GEOFENCE = 'GEOFENCE',
  SHARED_USER = 'SHARED_USER',
  FEATURE = 'FEATURE',
}

export interface LimitMetadata {
  type: LimitType;
  feature?: string; // Para LimitType.FEATURE
  message?: string;
}

/**
 * Guard para verificar límites de suscripción
 *
 * Uso:
 * @UseGuards(SubscriptionLimitGuard)
 * @RequireLimit({ type: LimitType.DEVICE })
 * async createDevice() { ... }
 *
 * @UseGuards(SubscriptionLimitGuard)
 * @RequireLimit({ type: LimitType.FEATURE, feature: 'whatsappNotifications' })
 * async sendWhatsApp() { ... }
 */
@Injectable()
export class SubscriptionLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitMetadata = this.reflector.get<LimitMetadata>('limit', context.getHandler());

    if (!limitMetadata) {
      return true; // No limit specified, allow
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const subscription = await this.subscriptionsService.getSubscription(userId);

    switch (limitMetadata.type) {
      case LimitType.DEVICE:
        // TODO: Get current device count from DevicesService
        const currentDevices = 0; // placeholder
        const canAddDevice = subscription.canAddDevice(currentDevices);

        if (!canAddDevice) {
          throw new ForbiddenException(
            limitMetadata.message ||
            `Has alcanzado el límite de dispositivos de tu plan (${subscription.maxDevices}). Mejora tu plan para agregar más dispositivos.`,
          );
        }
        break;

      case LimitType.GEOFENCE:
        // TODO: Get current geofence count from GeofencesService
        const currentGeofences = 0; // placeholder
        const canAddGeofence = subscription.canAddGeofence(currentGeofences);

        if (!canAddGeofence) {
          throw new ForbiddenException(
            limitMetadata.message ||
            `Has alcanzado el límite de geocercas de tu plan (${subscription.maxGeofences}). Mejora tu plan para agregar más geocercas.`,
          );
        }
        break;

      case LimitType.SHARED_USER:
        // TODO: Get current shared users count
        const currentSharedUsers = 0; // placeholder
        const canShareWith = subscription.canShareWith(currentSharedUsers);

        if (!canShareWith) {
          throw new ForbiddenException(
            limitMetadata.message ||
            `Has alcanzado el límite de usuarios compartidos de tu plan (${subscription.maxSharedUsers}). Mejora tu plan para compartir con más usuarios.`,
          );
        }
        break;

      case LimitType.FEATURE:
        if (!limitMetadata.feature) {
          throw new Error('Feature name required for FEATURE limit type');
        }

        const hasFeature = subscription.isFeatureEnabled(limitMetadata.feature);

        if (!hasFeature) {
          throw new ForbiddenException(
            limitMetadata.message ||
            `Esta función no está disponible en tu plan actual. Mejora tu plan para acceder a esta función.`,
          );
        }
        break;

      default:
        return true;
    }

    return true;
  }
}

// Decorator para especificar el límite requerido
export const RequireLimit = (metadata: LimitMetadata) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('limit', metadata, descriptor?.value || target);
  };
};
