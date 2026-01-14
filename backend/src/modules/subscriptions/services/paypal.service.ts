import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BillingPeriod, SubscriptionPlan } from '../entities/subscription.entity';
import { getPlanConfig } from '../config/plans.config';

/**
 * PayPal Service - Basic implementation
 * For full PayPal integration, use PayPal REST API directly or PayPal buttons in frontend
 */
@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private readonly isEnabled: boolean;
  private readonly mode: 'sandbox' | 'live';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiBase: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.mode = (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox';
    this.isEnabled = !!(this.clientId && this.clientSecret);

    this.apiBase = this.mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    if (this.isEnabled) {
      this.logger.log(`💰 PayPal service initialized in ${this.mode} mode`);
    } else {
      this.logger.warn('⚠️  PayPal disabled (missing credentials)');
    }
  }

  // ==================== Auth ====================

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    if (!this.isEnabled) {
      throw new BadRequestException('PayPal is not configured');
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!response.ok) {
      this.logger.error('Failed to get PayPal access token:', data);
      throw new BadRequestException('Failed to authenticate with PayPal');
    }

    return data.access_token;
  }

  // ==================== Orders ====================

  /**
   * Create a PayPal order
   */
  async createOrder(data: {
    amount: string;
    currency: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ orderId: string; approvalUrl: string }> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: data.currency,
              value: data.amount,
            },
            description: data.description,
          },
        ],
        application_context: {
          return_url: data.returnUrl,
          cancel_url: data.cancelUrl,
          brand_name: 'Prologix GPS',
          locale: 'es-MX',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      this.logger.error('Failed to create PayPal order:', result);
      throw new BadRequestException('Failed to create PayPal order');
    }

    const approvalUrl = result.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new BadRequestException('No approval URL returned from PayPal');
    }

    this.logger.log(`✅ PayPal order created: ${result.id}`);

    return {
      orderId: result.id,
      approvalUrl,
    };
  }

  /**
   * Capture a PayPal order after approval
   */
  async captureOrder(orderId: string): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      this.logger.error(`Failed to capture PayPal order ${orderId}:`, result);
      throw new BadRequestException('Failed to capture PayPal order');
    }

    this.logger.log(`✅ PayPal order captured: ${orderId}`);
    return result;
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.apiBase}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      this.logger.error(`Failed to get PayPal order ${orderId}:`, result);
      throw new BadRequestException('Failed to get PayPal order details');
    }

    return result;
  }

  // ==================== Utilities ====================

  /**
   * Calculate price for a plan
   */
  calculatePrice(plan: SubscriptionPlan, billingPeriod: BillingPeriod, deviceCount: number): string {
    const planConfig = getPlanConfig(plan);
    const pricePerDevice = billingPeriod === BillingPeriod.MONTHLY
      ? planConfig.pricing.monthlyPricePerDevice
      : planConfig.pricing.yearlyPricePerDevice;

    const total = pricePerDevice * deviceCount;
    return total.toFixed(2);
  }

  /**
   * Check if sandbox mode
   */
  isSandbox(): boolean {
    return this.mode === 'sandbox';
  }

  /**
   * Get service info
   */
  getServiceInfo() {
    return {
      enabled: this.isEnabled,
      mode: this.mode,
      isSandbox: this.isSandbox(),
    };
  }
}
