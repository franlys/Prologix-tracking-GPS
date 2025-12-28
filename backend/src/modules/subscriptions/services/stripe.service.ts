import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { BillingPeriod, SubscriptionPlan } from '../entities/subscription.entity';
import { PaymentMethod, PaymentStatus } from '../entities/payment-history.entity';
import { calculatePriceWithVolume, getPlanConfig } from '../config/plans.config';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly isEnabled: boolean;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    this.isEnabled = !!apiKey;

    if (this.isEnabled) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-12-15.clover',
      });
      this.logger.log('💳 Stripe service initialized');
    } else {
      this.logger.warn('⚠️  Stripe disabled (missing STRIPE_SECRET_KEY)');
    }
  }

  // ==================== Clientes ====================

  async createCustomer(data: {
    email: string;
    name: string;
    phone?: string;
    metadata?: any;
  }): Promise<Stripe.Customer> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const customer = await this.stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata || {},
    });

    this.logger.log(`✅ Stripe customer created: ${customer.id} (${data.email})`);

    return customer;
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>;
  }

  async updateCustomer(customerId: string, data: Partial<Stripe.CustomerUpdateParams>): Promise<Stripe.Customer> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.customers.update(customerId, data);
  }

  // ==================== Métodos de Pago ====================

  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Establecer como método de pago por defecto
    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    this.logger.log(`✅ Payment method ${paymentMethodId} attached to customer ${customerId}`);

    return paymentMethod;
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  }

  // ==================== Suscripciones ====================

  async createSubscription(data: {
    customerId: string;
    plan: SubscriptionPlan;
    billingPeriod: BillingPeriod;
    deviceCount: number;
    trialDays?: number;
    couponCode?: string;
  }): Promise<Stripe.Subscription> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const planConfig = getPlanConfig(data.plan);
    const priceId = data.billingPeriod === BillingPeriod.MONTHLY
      ? planConfig.pricing.stripePriceIdMonthly
      : planConfig.pricing.stripePriceIdYearly;

    if (!priceId) {
      throw new BadRequestException('Stripe price ID not configured for this plan');
    }

    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: data.customerId,
      items: [
        {
          price: priceId,
          quantity: data.deviceCount,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        plan: data.plan,
        deviceCount: data.deviceCount.toString(),
      },
    };

    if (data.trialDays && data.trialDays > 0) {
      subscriptionData.trial_period_days = data.trialDays;
    }

    if (data.couponCode) {
      (subscriptionData as any).coupon = data.couponCode;
    }

    const subscription = await this.stripe.subscriptions.create(subscriptionData);

    this.logger.log(`✅ Stripe subscription created: ${subscription.id} for customer ${data.customerId}`);

    return subscription;
  }

  async updateSubscription(subscriptionId: string, data: {
    deviceCount?: number;
    priceId?: string;
  }): Promise<Stripe.Subscription> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    const updateData: Stripe.SubscriptionUpdateParams = {};

    if (data.deviceCount) {
      updateData.items = [
        {
          id: subscription.items.data[0].id,
          quantity: data.deviceCount,
        },
      ];
    }

    if (data.priceId) {
      updateData.items = [
        {
          id: subscription.items.data[0].id,
          price: data.priceId,
        },
      ];
    }

    return this.stripe.subscriptions.update(subscriptionId, updateData);
  }

  async cancelSubscription(subscriptionId: string, cancelImmediately: boolean = false): Promise<Stripe.Subscription> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    if (cancelImmediately) {
      return this.stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancelar al final del período
      return this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  // ==================== Payment Intents (Pagos únicos) ====================

  async createPaymentIntent(data: {
    amount: number; // en centavos (ej: 2999 = $29.99)
    currency: string;
    customerId: string;
    description?: string;
    metadata?: any;
  }): Promise<Stripe.PaymentIntent> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency.toLowerCase(),
      customer: data.customerId,
      description: data.description,
      metadata: data.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    this.logger.log(`✅ Payment intent created: ${paymentIntent.id} for ${data.amount} ${data.currency}`);

    return paymentIntent;
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  // ==================== Invoices ====================

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.invoices.retrieve(invoiceId);
  }

  async listInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  }

  async createInvoiceItem(data: {
    customerId: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<Stripe.InvoiceItem> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.invoiceItems.create({
      customer: data.customerId,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
    });
  }

  // ==================== Cupones ====================

  async createCoupon(data: {
    id: string;
    percentOff?: number;
    amountOff?: number;
    currency?: string;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths?: number;
  }): Promise<Stripe.Coupon> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.coupons.create({
      id: data.id,
      percent_off: data.percentOff,
      amount_off: data.amountOff,
      currency: data.currency,
      duration: data.duration,
      duration_in_months: data.durationInMonths,
    });
  }

  async getCoupon(couponId: string): Promise<Stripe.Coupon> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.coupons.retrieve(couponId);
  }

  // ==================== Webhooks ====================

  async constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      this.logger.error('❌ Webhook signature verification failed', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  // ==================== Métodos de pago para México ====================

  async createOxxoPaymentIntent(data: {
    amount: number;
    customerId: string;
    email: string;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'mxn',
      customer: data.customerId,
      description: data.description,
      payment_method_types: ['oxxo'],
      metadata: {
        email: data.email,
      },
    });

    this.logger.log(`✅ OXXO payment intent created: ${paymentIntent.id}`);

    return paymentIntent;
  }

  async createSPEIPaymentIntent(data: {
    amount: number;
    customerId: string;
    email: string;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'mxn',
      customer: data.customerId,
      description: data.description,
      payment_method_types: ['customer_balance'],
      payment_method_data: {
        type: 'customer_balance',
      },
      payment_method_options: {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'mx_bank_transfer',
          },
        },
      },
      metadata: {
        email: data.email,
      },
    });

    this.logger.log(`✅ SPEI payment intent created: ${paymentIntent.id}`);

    return paymentIntent;
  }

  // ==================== Helpers ====================

  async getCustomerPortalUrl(customerId: string, returnUrl: string): Promise<string> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  async createCheckoutSession(data: {
    customerId: string;
    plan: SubscriptionPlan;
    billingPeriod: BillingPeriod;
    deviceCount: number;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
  }): Promise<Stripe.Checkout.Session> {
    if (!this.isEnabled) {
      throw new BadRequestException('Stripe is not configured');
    }

    const planConfig = getPlanConfig(data.plan);
    const priceId = data.billingPeriod === BillingPeriod.MONTHLY
      ? planConfig.pricing.stripePriceIdMonthly
      : planConfig.pricing.stripePriceIdYearly;

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      customer: data.customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: data.deviceCount,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        plan: data.plan,
        deviceCount: data.deviceCount.toString(),
      },
    };

    if (data.trialDays && data.trialDays > 0) {
      sessionData.subscription_data = {
        trial_period_days: data.trialDays,
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionData);

    this.logger.log(`✅ Checkout session created: ${session.id}`);

    return session;
  }
}
