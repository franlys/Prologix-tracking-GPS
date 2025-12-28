import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionPlan, SubscriptionStatus, BillingPeriod } from '../entities/subscription.entity';
import { PaymentHistory, PaymentStatus, PaymentMethod } from '../entities/payment-history.entity';
import { User } from '../../users/entities/user.entity';
import { PLANS, getPlanConfig, calculatePriceWithVolume } from '../config/plans.config';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepo: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepo: Repository<PaymentHistory>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // ==================== CRUD de Suscripciones ====================

  async getSubscription(userId: string): Promise<Subscription> {
    let subscription = await this.subscriptionsRepo.findOne({
      where: { userId },
      relations: ['user'],
    });

    // Si no existe, crear suscripción gratuita por defecto
    if (!subscription) {
      subscription = await this.createFreeSubscription(userId);
    }

    return subscription;
  }

  async createFreeSubscription(userId: string): Promise<Subscription> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const planConfig = getPlanConfig(SubscriptionPlan.FREE);

    const subscription = this.subscriptionsRepo.create({
      userId,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      billingPeriod: BillingPeriod.MONTHLY,
      maxDevices: planConfig.features.maxDevices,
      maxGeofences: planConfig.features.maxGeofences,
      maxSharedUsers: planConfig.features.maxSharedUsers,
      historyRetentionDays: planConfig.features.historyRetentionDays,
      whatsappNotifications: planConfig.features.whatsappNotifications,
      advancedReports: planConfig.features.advancedReports,
      apiAccess: planConfig.features.apiAccess,
      whiteLabel: planConfig.features.whiteLabel,
      driverManagement: planConfig.features.driverManagement,
      fuelManagement: planConfig.features.fuelManagement,
      predictiveMaintenance: planConfig.features.predictiveMaintenance,
      remoteControl: planConfig.features.remoteControl,
      aiPredictions: planConfig.features.aiPredictions,
      dashcamCloud: planConfig.features.dashcamCloud,
    });

    const saved = await this.subscriptionsRepo.save(subscription);
    this.logger.log(`✅ Created FREE subscription for user ${userId}`);
    return saved;
  }

  async startTrial(userId: string, plan: SubscriptionPlan): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);

    if (subscription.plan !== SubscriptionPlan.FREE) {
      throw new BadRequestException('Trial only available for free users');
    }

    const planConfig = getPlanConfig(plan);

    if (planConfig.trialDays === 0) {
      throw new BadRequestException('This plan does not offer a trial period');
    }

    // Configurar trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + planConfig.trialDays);

    subscription.plan = plan;
    subscription.status = SubscriptionStatus.TRIALING;
    subscription.trialEndsAt = trialEndsAt;
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = trialEndsAt;

    // Aplicar límites y features del nuevo plan
    this.applyPlanFeatures(subscription, plan);

    const updated = await this.subscriptionsRepo.save(subscription);
    this.logger.log(`✅ Started trial for user ${userId}: ${plan} (${planConfig.trialDays} days)`);

    return updated;
  }

  async upgradePlan(
    userId: string,
    newPlan: SubscriptionPlan,
    billingPeriod: BillingPeriod,
    deviceCount: number,
    paymentMethodId?: string,
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);

    // Validar que es un upgrade válido
    const planHierarchy = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.BASICO,
      SubscriptionPlan.PROFESIONAL,
      SubscriptionPlan.EMPRESARIAL,
    ];

    const currentIndex = planHierarchy.indexOf(subscription.plan);
    const newIndex = planHierarchy.indexOf(newPlan);

    if (newIndex <= currentIndex && newPlan !== subscription.plan) {
      throw new BadRequestException('Invalid plan change. Use downgradePlan for downgrades.');
    }

    // Calcular precio
    const price = calculatePriceWithVolume(
      newPlan,
      deviceCount,
      billingPeriod === BillingPeriod.MONTHLY ? 'monthly' : 'yearly',
    );

    this.logger.log(`Upgrading user ${userId} to ${newPlan}: ${price} MXN (${deviceCount} devices)`);

    // Aplicar nuevo plan
    subscription.plan = newPlan;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.billingPeriod = billingPeriod;
    subscription.trialEndsAt = null;

    const now = new Date();
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = this.calculatePeriodEnd(now, billingPeriod);

    this.applyPlanFeatures(subscription, newPlan);

    const updated = await this.subscriptionsRepo.save(subscription);

    // Aquí se integrará con Stripe para el pago
    // TODO: Implementar lógica de pago con Stripe

    this.logger.log(`✅ Upgraded user ${userId} to ${newPlan}`);

    return updated;
  }

  async downgradePlan(userId: string, newPlan: SubscriptionPlan): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);

    // Validar que es un downgrade válido
    const planHierarchy = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.BASICO,
      SubscriptionPlan.PROFESIONAL,
      SubscriptionPlan.EMPRESARIAL,
    ];

    const currentIndex = planHierarchy.indexOf(subscription.plan);
    const newIndex = planHierarchy.indexOf(newPlan);

    if (newIndex >= currentIndex) {
      throw new BadRequestException('Invalid plan change. Use upgradePlan for upgrades.');
    }

    // El downgrade se aplicará al final del período actual
    subscription.plan = newPlan;
    this.applyPlanFeatures(subscription, newPlan);

    const updated = await this.subscriptionsRepo.save(subscription);

    this.logger.log(`✅ Scheduled downgrade for user ${userId} to ${newPlan} at period end`);

    return updated;
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);

    if (subscription.plan === SubscriptionPlan.FREE) {
      throw new BadRequestException('Cannot cancel free subscription');
    }

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();

    // Cancelar en Stripe
    // TODO: Implementar cancelación en Stripe

    const updated = await this.subscriptionsRepo.save(subscription);

    this.logger.log(`✅ Canceled subscription for user ${userId}`);

    return updated;
  }

  async reactivateSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);

    if (subscription.status !== SubscriptionStatus.CANCELED) {
      throw new BadRequestException('Can only reactivate canceled subscriptions');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.canceledAt = null;

    const updated = await this.subscriptionsRepo.save(subscription);

    this.logger.log(`✅ Reactivated subscription for user ${userId}`);

    return updated;
  }

  // ==================== Verificación de Límites ====================

  async canAddDevice(userId: string, currentDeviceCount: number): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return subscription.canAddDevice(currentDeviceCount);
  }

  async canAddGeofence(userId: string, currentGeofenceCount: number): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return subscription.canAddGeofence(currentGeofenceCount);
  }

  async canShareWith(userId: string, currentSharedUsersCount: number): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return subscription.canShareWith(currentSharedUsersCount);
  }

  async hasFeature(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    return subscription.isFeatureEnabled(feature);
  }

  // ==================== Historial de Pagos ====================

  async getPaymentHistory(userId: string, limit: number = 50): Promise<PaymentHistory[]> {
    return this.paymentHistoryRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async createPayment(data: {
    userId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    description?: string;
    stripePaymentIntentId?: string;
    metadata?: any;
  }): Promise<PaymentHistory> {
    const payment = this.paymentHistoryRepo.create(data);
    const saved = await this.paymentHistoryRepo.save(payment);

    this.logger.log(`💰 Payment recorded: ${data.amount} ${data.currency} for user ${data.userId}`);

    return saved;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    metadata?: any,
  ): Promise<PaymentHistory> {
    const payment = await this.paymentHistoryRepo.findOne({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    if (status === PaymentStatus.SUCCEEDED) {
      payment.paidAt = new Date();
    }
    if (metadata) {
      payment.metadata = { ...payment.metadata, ...metadata };
    }

    return this.paymentHistoryRepo.save(payment);
  }

  // ==================== Cupones y Descuentos ====================

  async applyCoupon(userId: string, couponCode: string): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);

    // TODO: Validar cupón en base de datos o Stripe
    // Por ahora, ejemplo hardcoded
    const validCoupons = {
      'LAUNCH2025': 20, // 20% descuento
      'INSTALADOR10': 10, // 10% descuento
      'REFERIDO': 10, // 10% descuento
    };

    const discountPercent = validCoupons[couponCode.toUpperCase()];

    if (!discountPercent) {
      throw new BadRequestException('Invalid coupon code');
    }

    subscription.couponCode = couponCode.toUpperCase();
    subscription.discountPercent = discountPercent;

    const updated = await this.subscriptionsRepo.save(subscription);

    this.logger.log(`✅ Applied coupon ${couponCode} (${discountPercent}%) to user ${userId}`);

    return updated;
  }

  // ==================== Helpers Privados ====================

  private applyPlanFeatures(subscription: Subscription, plan: SubscriptionPlan): void {
    const planConfig = getPlanConfig(plan);

    subscription.maxDevices = planConfig.features.maxDevices;
    subscription.maxGeofences = planConfig.features.maxGeofences;
    subscription.maxSharedUsers = planConfig.features.maxSharedUsers;
    subscription.historyRetentionDays = planConfig.features.historyRetentionDays;

    subscription.whatsappNotifications = planConfig.features.whatsappNotifications;
    subscription.advancedReports = planConfig.features.advancedReports;
    subscription.apiAccess = planConfig.features.apiAccess;
    subscription.whiteLabel = planConfig.features.whiteLabel;
    subscription.driverManagement = planConfig.features.driverManagement;
    subscription.fuelManagement = planConfig.features.fuelManagement;
    subscription.predictiveMaintenance = planConfig.features.predictiveMaintenance;
    subscription.remoteControl = planConfig.features.remoteControl;
    subscription.aiPredictions = planConfig.features.aiPredictions;
    subscription.dashcamCloud = planConfig.features.dashcamCloud;
  }

  private calculatePeriodEnd(start: Date, billingPeriod: BillingPeriod): Date {
    const end = new Date(start);

    if (billingPeriod === BillingPeriod.MONTHLY) {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }

    return end;
  }

  // ==================== Estadísticas ====================

  async getSubscriptionStats(userId: string): Promise<{
    plan: string;
    status: string;
    devicesUsed: number;
    devicesLimit: number;
    geofencesUsed: number;
    geofencesLimit: number;
    daysUntilRenewal: number;
    totalSpent: number;
  }> {
    const subscription = await this.getSubscription(userId);

    // TODO: Obtener datos reales de dispositivos y geocercas
    const devicesUsed = 0; // await this.devicesService.countByUser(userId);
    const geofencesUsed = 0; // await this.geofencesService.countByUser(userId);

    const payments = await this.getPaymentHistory(userId, 999);
    const totalSpent = payments
      .filter(p => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const daysUntilRenewal = subscription.currentPeriodEnd
      ? Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      plan: subscription.plan,
      status: subscription.status,
      devicesUsed,
      devicesLimit: subscription.maxDevices,
      geofencesUsed,
      geofencesLimit: subscription.maxGeofences,
      daysUntilRenewal,
      totalSpent,
    };
  }

  // ==================== Auto-gestión de Trials ====================

  async checkExpiredTrials(): Promise<void> {
    const now = new Date();

    const expiredTrials = await this.subscriptionsRepo.find({
      where: {
        status: SubscriptionStatus.TRIALING,
      },
    });

    for (const subscription of expiredTrials) {
      if (subscription.trialEndsAt && subscription.trialEndsAt < now) {
        // Si no hay método de pago, downgrade a FREE
        if (!subscription.stripeCustomerId) {
          this.logger.log(`⏰ Trial expired for user ${subscription.userId}, downgrading to FREE`);
          subscription.plan = SubscriptionPlan.FREE;
          subscription.status = SubscriptionStatus.ACTIVE;
          this.applyPlanFeatures(subscription, SubscriptionPlan.FREE);
          await this.subscriptionsRepo.save(subscription);
        } else {
          // Si hay método de pago, activar suscripción
          subscription.status = SubscriptionStatus.ACTIVE;
          await this.subscriptionsRepo.save(subscription);
          this.logger.log(`✅ Trial ended for user ${subscription.userId}, subscription activated`);
        }
      }
    }
  }
}
