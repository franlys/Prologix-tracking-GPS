import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PayPalClient, CreateSubscriptionRequest, BillingPlan } from '@paypal/paypal-server-sdk';
import { BillingPeriod, SubscriptionPlan } from '../entities/subscription.entity';
import { calculatePriceWithVolume, getPlanConfig } from '../config/plans.config';

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private readonly paypalClient: PayPalClient | null = null;
  private readonly isEnabled: boolean;
  private readonly mode: 'sandbox' | 'live';

  constructor() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.mode = (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox';

    this.isEnabled = !!(clientId && clientSecret);

    if (this.isEnabled) {
      this.paypalClient = new PayPalClient({
        clientId,
        clientSecret,
        environment: this.mode,
      });
      this.logger.log(`💰 PayPal service initialized in ${this.mode} mode`);
    } else {
      this.logger.warn('⚠️  PayPal disabled (missing credentials)');
    }
  }

  // ==================== Validaciones ====================

  private ensureEnabled() {
    if (!this.isEnabled || !this.paypalClient) {
      throw new BadRequestException('PayPal is not configured');
    }
  }

  // ==================== Planes de Suscripción ====================

  /**
   * Crear un plan de suscripción en PayPal
   */
  async createSubscriptionPlan(
    plan: SubscriptionPlan,
    billingPeriod: BillingPeriod,
  ): Promise<string> {
    this.ensureEnabled();

    const planConfig = getPlanConfig(plan);
    const pricePerDevice = billingPeriod === BillingPeriod.MONTHLY
      ? planConfig.pricing.monthlyPricePerDevice
      : planConfig.pricing.yearlyPricePerDevice;

    const billingCycles = [{
      frequency: {
        interval_unit: billingPeriod === BillingPeriod.MONTHLY ? 'MONTH' : 'YEAR',
        interval_count: 1,
      },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0, // Indefinido
      pricing_scheme: {
        fixed_price: {
          value: pricePerDevice.toString(),
          currency_code: 'MXN',
        },
      },
    }];

    try {
      const response = await this.paypalClient.billingPlans.create({
        name: `${planConfig.name} - ${billingPeriod === BillingPeriod.MONTHLY ? 'Mensual' : 'Anual'}`,
        description: planConfig.description,
        type: 'INFINITE',
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
        billing_cycles: billingCycles,
      });

      this.logger.log(`✅ PayPal plan created: ${response.id}`);
      return response.id;
    } catch (error) {
      this.logger.error('❌ Error creating PayPal plan:', error);
      throw new BadRequestException('Failed to create PayPal subscription plan');
    }
  }

  // ==================== Suscripciones ====================

  /**
   * Crear una suscripción para un cliente
   */
  async createSubscription(data: {
    planId: string;
    returnUrl: string;
    cancelUrl: string;
    userId: string;
  }): Promise<{ subscriptionId: string; approvalUrl: string }> {
    this.ensureEnabled();

    try {
      const response = await this.paypalClient.subscriptions.create({
        plan_id: data.planId,
        application_context: {
          return_url: data.returnUrl,
          cancel_url: data.cancelUrl,
          brand_name: 'Prologix GPS',
          locale: 'es-MX',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
        },
        custom_id: data.userId, // Para identificar al usuario en webhooks
      });

      const approvalUrl = response.links.find(link => link.rel === 'approve')?.href;

      if (!approvalUrl) {
        throw new BadRequestException('No approval URL returned from PayPal');
      }

      this.logger.log(`✅ PayPal subscription created: ${response.id}`);

      return {
        subscriptionId: response.id,
        approvalUrl,
      };
    } catch (error) {
      this.logger.error('❌ Error creating PayPal subscription:', error);
      throw new BadRequestException('Failed to create PayPal subscription');
    }
  }

  /**
   * Obtener detalles de una suscripción
   */
  async getSubscription(subscriptionId: string) {
    this.ensureEnabled();

    try {
      const response = await this.paypalClient.subscriptions.showDetails(subscriptionId);
      return response;
    } catch (error) {
      this.logger.error(`❌ Error getting PayPal subscription ${subscriptionId}:`, error);
      throw new BadRequestException('Failed to get PayPal subscription details');
    }
  }

  /**
   * Cancelar una suscripción
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    this.ensureEnabled();

    try {
      await this.paypalClient.subscriptions.cancel(subscriptionId, {
        reason: reason || 'Customer requested cancellation',
      });

      this.logger.log(`✅ PayPal subscription cancelled: ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`❌ Error cancelling PayPal subscription ${subscriptionId}:`, error);
      throw new BadRequestException('Failed to cancel PayPal subscription');
    }
  }

  /**
   * Suspender una suscripción
   */
  async suspendSubscription(subscriptionId: string, reason?: string): Promise<void> {
    this.ensureEnabled();

    try {
      await this.paypalClient.subscriptions.suspend(subscriptionId, {
        reason: reason || 'Payment failed',
      });

      this.logger.log(`✅ PayPal subscription suspended: ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`❌ Error suspending PayPal subscription ${subscriptionId}:`, error);
      throw new BadRequestException('Failed to suspend PayPal subscription');
    }
  }

  /**
   * Reactivar una suscripción suspendida
   */
  async activateSubscription(subscriptionId: string): Promise<void> {
    this.ensureEnabled();

    try {
      await this.paypalClient.subscriptions.activate(subscriptionId, {
        reason: 'Customer reactivated',
      });

      this.logger.log(`✅ PayPal subscription activated: ${subscriptionId}`);
    } catch (error) {
      this.logger.error(`❌ Error activating PayPal subscription ${subscriptionId}:`, error);
      throw new BadRequestException('Failed to activate PayPal subscription');
    }
  }

  // ==================== Transacciones ====================

  /**
   * Listar transacciones de una suscripción
   */
  async listTransactions(subscriptionId: string, startDate: Date, endDate: Date) {
    this.ensureEnabled();

    try {
      const response = await this.paypalClient.subscriptions.listTransactions(
        subscriptionId,
        startDate.toISOString(),
        endDate.toISOString(),
      );

      return response.transactions || [];
    } catch (error) {
      this.logger.error(`❌ Error listing transactions for ${subscriptionId}:`, error);
      return [];
    }
  }

  // ==================== Webhooks ====================

  /**
   * Verificar firma de webhook de PayPal
   */
  async verifyWebhookSignature(payload: any, headers: any): Promise<boolean> {
    this.ensureEnabled();

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
      this.logger.warn('⚠️  PAYPAL_WEBHOOK_ID not configured, skipping verification');
      return true; // En desarrollo, permitir sin verificación
    }

    try {
      const response = await this.paypalClient.webhooks.verifySignature({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: payload,
      });

      return response.verification_status === 'SUCCESS';
    } catch (error) {
      this.logger.error('❌ Error verifying webhook signature:', error);
      return false;
    }
  }

  // ==================== Utilidades ====================

  /**
   * Obtener URL de aprobación de un pedido
   */
  getApprovalUrl(links: any[]): string | null {
    const approvalLink = links.find(link => link.rel === 'approve');
    return approvalLink?.href || null;
  }

  /**
   * Verificar si está en modo sandbox
   */
  isSandbox(): boolean {
    return this.mode === 'sandbox';
  }

  /**
   * Obtener información del servicio
   */
  getServiceInfo() {
    return {
      enabled: this.isEnabled,
      mode: this.mode,
      isSandbox: this.isSandbox(),
    };
  }
}
