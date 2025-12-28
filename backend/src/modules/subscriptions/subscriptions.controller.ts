import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { SubscriptionsService } from './services/subscriptions.service';
import { StripeService } from './services/stripe.service';
import { SubscriptionPlan, BillingPeriod } from './entities/subscription.entity';
import { PLANS, calculatePriceWithVolume } from './config/plans.config';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
  ) {}

  // ==================== Información de Planes ====================

  @Public()
  @Get('plans')
  async getPlans() {
    return {
      plans: Object.values(PLANS).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        tagline: plan.tagline,
        recommended: plan.recommended,
        trialDays: plan.trialDays,
        features: plan.features,
        pricing: {
          monthly: plan.pricing.monthlyPricePerDevice,
          yearly: plan.pricing.yearlyPricePerDevice,
          currency: plan.pricing.currency,
          volumeDiscounts: plan.pricing.volumeDiscounts,
        },
      })),
    };
  }

  @Get('plans/:plan/calculate')
  async calculatePrice(
    @Param('plan') plan: SubscriptionPlan,
    @Query('devices') devices: string,
    @Query('period') period: string,
  ) {
    const deviceCount = parseInt(devices, 10);
    const billingPeriod = period === 'yearly' ? 'yearly' : 'monthly';

    const totalPrice = calculatePriceWithVolume(plan, deviceCount, billingPeriod);
    const pricePerDevice = totalPrice / deviceCount;

    return {
      plan,
      deviceCount,
      billingPeriod,
      pricePerDevice: pricePerDevice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      currency: 'MXN',
    };
  }

  // ==================== Suscripción del Usuario ====================

  @Get('me')
  async getMySubscription(@Request() req) {
    const subscription = await this.subscriptionsService.getSubscription(req.user.userId);

    return {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      billingPeriod: subscription.billingPeriod,
      limits: {
        maxDevices: subscription.maxDevices,
        maxGeofences: subscription.maxGeofences,
        maxSharedUsers: subscription.maxSharedUsers,
        historyRetentionDays: subscription.historyRetentionDays,
      },
      features: {
        whatsappNotifications: subscription.whatsappNotifications,
        advancedReports: subscription.advancedReports,
        apiAccess: subscription.apiAccess,
        whiteLabel: subscription.whiteLabel,
        driverManagement: subscription.driverManagement,
        fuelManagement: subscription.fuelManagement,
        predictiveMaintenance: subscription.predictiveMaintenance,
        remoteControl: subscription.remoteControl,
        aiPredictions: subscription.aiPredictions,
        dashcamCloud: subscription.dashcamCloud,
      },
      trial: subscription.isInTrial() ? {
        active: true,
        endsAt: subscription.trialEndsAt,
      } : null,
      currentPeriod: subscription.currentPeriodStart ? {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
      } : null,
      discount: subscription.discountPercent > 0 ? {
        percent: subscription.discountPercent,
        coupon: subscription.couponCode,
      } : null,
    };
  }

  @Get('me/stats')
  async getMyStats(@Request() req) {
    return this.subscriptionsService.getSubscriptionStats(req.user.userId);
  }

  // ==================== Gestión de Suscripción ====================

  @Post('trial/start')
  async startTrial(
    @Request() req,
    @Body() body: { plan: SubscriptionPlan },
  ) {
    const subscription = await this.subscriptionsService.startTrial(req.user.userId, body.plan);

    return {
      message: 'Trial started successfully',
      subscription: {
        plan: subscription.plan,
        trialEndsAt: subscription.trialEndsAt,
      },
    };
  }

  @Post('upgrade')
  async upgradePlan(
    @Request() req,
    @Body() body: {
      plan: SubscriptionPlan;
      billingPeriod: BillingPeriod;
      deviceCount: number;
      paymentMethodId?: string;
    },
  ) {
    const subscription = await this.subscriptionsService.upgradePlan(
      req.user.userId,
      body.plan,
      body.billingPeriod,
      body.deviceCount,
      body.paymentMethodId,
    );

    return {
      message: 'Plan upgraded successfully',
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
      },
    };
  }

  @Post('downgrade')
  async downgradePlan(
    @Request() req,
    @Body() body: { plan: SubscriptionPlan },
  ) {
    const subscription = await this.subscriptionsService.downgradePlan(req.user.userId, body.plan);

    return {
      message: 'Plan downgrade scheduled for end of current period',
      subscription: {
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    };
  }

  @Post('cancel')
  async cancelSubscription(@Request() req) {
    const subscription = await this.subscriptionsService.cancelSubscription(req.user.userId);

    return {
      message: 'Subscription canceled successfully',
      canceledAt: subscription.canceledAt,
    };
  }

  @Post('reactivate')
  async reactivateSubscription(@Request() req) {
    const subscription = await this.subscriptionsService.reactivateSubscription(req.user.userId);

    return {
      message: 'Subscription reactivated successfully',
      status: subscription.status,
    };
  }

  // ==================== Cupones ====================

  @Post('coupon/apply')
  async applyCoupon(
    @Request() req,
    @Body() body: { couponCode: string },
  ) {
    const subscription = await this.subscriptionsService.applyCoupon(req.user.userId, body.couponCode);

    return {
      message: 'Coupon applied successfully',
      discount: {
        code: subscription.couponCode,
        percent: subscription.discountPercent,
      },
    };
  }

  // ==================== Historial de Pagos ====================

  @Get('payments')
  async getPaymentHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.subscriptionsService.getPaymentHistory(req.user.userId, limitNumber);
  }

  // ==================== Stripe Checkout ====================

  @Post('checkout/create')
  async createCheckoutSession(
    @Request() req,
    @Body() body: {
      plan: SubscriptionPlan;
      billingPeriod: BillingPeriod;
      deviceCount: number;
    },
  ) {
    const subscription = await this.subscriptionsService.getSubscription(req.user.userId);

    // Crear o obtener cliente de Stripe
    let stripeCustomerId = subscription.stripeCustomerId;

    if (!stripeCustomerId) {
      const user = req.user;
      const customer = await this.stripeService.createCustomer({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.userId,
        },
      });

      stripeCustomerId = customer.id;

      // Guardar en la suscripción
      subscription.stripeCustomerId = stripeCustomerId;
      await this.subscriptionsService.getSubscription(req.user.userId); // Save will happen in service
    }

    // Crear sesión de checkout
    const planConfig = PLANS[body.plan];
    const session = await this.stripeService.createCheckoutSession({
      customerId: stripeCustomerId,
      plan: body.plan,
      billingPeriod: body.billingPeriod,
      deviceCount: body.deviceCount,
      successUrl: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL}/subscription/cancel`,
      trialDays: planConfig.trialDays,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  @Get('portal')
  async getCustomerPortal(@Request() req) {
    const subscription = await this.subscriptionsService.getSubscription(req.user.userId);

    if (!subscription.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const url = await this.stripeService.getCustomerPortalUrl(
      subscription.stripeCustomerId,
      `${process.env.FRONTEND_URL}/subscription`,
    );

    return { url };
  }

  // ==================== Verificación de Límites (para uso interno) ====================

  @Get('limits/devices')
  async canAddDevice(@Request() req, @Query('current') current: string) {
    const currentCount = parseInt(current, 10);
    const canAdd = await this.subscriptionsService.canAddDevice(req.user.userId, currentCount);

    return { canAdd };
  }

  @Get('limits/geofences')
  async canAddGeofence(@Request() req, @Query('current') current: string) {
    const currentCount = parseInt(current, 10);
    const canAdd = await this.subscriptionsService.canAddGeofence(req.user.userId, currentCount);

    return { canAdd };
  }

  @Get('limits/shared-users')
  async canShareWith(@Request() req, @Query('current') current: string) {
    const currentCount = parseInt(current, 10);
    const canAdd = await this.subscriptionsService.canShareWith(req.user.userId, currentCount);

    return { canAdd };
  }

  @Get('features/:feature')
  async hasFeature(@Request() req, @Param('feature') feature: string) {
    const hasAccess = await this.subscriptionsService.hasFeature(req.user.userId, feature);

    return { hasAccess };
  }
}
