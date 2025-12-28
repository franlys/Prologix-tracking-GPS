import {
  Controller,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './services/stripe.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { PaymentMethod, PaymentStatus } from './entities/payment-history.entity';
import { SubscriptionStatus } from './entities/subscription.entity';

@Controller('webhooks/stripe')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const payload = req.rawBody;

    try {
      const event = await this.stripeService.constructWebhookEvent(payload, signature);

      this.logger.log(`📨 Stripe webhook received: ${event.type}`);

      // Procesar evento según tipo
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('❌ Webhook processing error:', error);
      throw error;
    }
  }

  // ==================== Handlers de Eventos ====================

  private async handleCheckoutCompleted(session: any) {
    this.logger.log(`✅ Checkout completed: ${session.id}`);

    const userId = session.metadata?.userId;
    if (!userId) {
      this.logger.error('No userId in checkout session metadata');
      return;
    }

    const subscription = await this.subscriptionsService.getSubscription(userId);

    // Actualizar con IDs de Stripe
    subscription.stripeCustomerId = session.customer;
    subscription.stripeSubscriptionId = session.subscription;
    subscription.status = SubscriptionStatus.ACTIVE;

    // Guardar
    // await this.subscriptionsService.save(subscription);

    this.logger.log(`Subscription activated for user ${userId}`);
  }

  private async handleSubscriptionCreated(stripeSubscription: any) {
    this.logger.log(`✅ Subscription created: ${stripeSubscription.id}`);

    const customerId = stripeSubscription.customer;
    const userId = stripeSubscription.metadata?.userId;

    if (!userId) {
      this.logger.error('No userId in subscription metadata');
      return;
    }

    const subscription = await this.subscriptionsService.getSubscription(userId);
    subscription.stripeSubscriptionId = stripeSubscription.id;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

    if (stripeSubscription.trial_end) {
      subscription.trialEndsAt = new Date(stripeSubscription.trial_end * 1000);
      subscription.status = SubscriptionStatus.TRIALING;
    }

    // await this.subscriptionsService.save(subscription);
  }

  private async handleSubscriptionUpdated(stripeSubscription: any) {
    this.logger.log(`🔄 Subscription updated: ${stripeSubscription.id}`);

    const subscription = await this.findSubscriptionByStripeId(stripeSubscription.id);
    if (!subscription) return;

    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

    // Actualizar estado
    switch (stripeSubscription.status) {
      case 'active':
        subscription.status = SubscriptionStatus.ACTIVE;
        break;
      case 'trialing':
        subscription.status = SubscriptionStatus.TRIALING;
        break;
      case 'past_due':
        subscription.status = SubscriptionStatus.PAST_DUE;
        break;
      case 'canceled':
        subscription.status = SubscriptionStatus.CANCELED;
        subscription.canceledAt = new Date();
        break;
    }

    // await this.subscriptionsService.save(subscription);
  }

  private async handleSubscriptionDeleted(stripeSubscription: any) {
    this.logger.log(`❌ Subscription deleted: ${stripeSubscription.id}`);

    const subscription = await this.findSubscriptionByStripeId(stripeSubscription.id);
    if (!subscription) return;

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();

    // await this.subscriptionsService.save(subscription);
  }

  private async handleInvoicePaid(invoice: any) {
    this.logger.log(`💰 Invoice paid: ${invoice.id}`);

    const userId = await this.getUserIdFromCustomer(invoice.customer);
    if (!userId) return;

    const subscription = await this.subscriptionsService.getSubscription(userId);

    // Registrar pago
    await this.subscriptionsService.createPayment({
      userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_paid / 100, // Convertir de centavos
      currency: invoice.currency.toUpperCase(),
      paymentMethod: PaymentMethod.STRIPE_CARD,
      status: PaymentStatus.SUCCEEDED,
      description: invoice.description || 'Subscription payment',
      stripePaymentIntentId: invoice.payment_intent,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        pdfUrl: invoice.invoice_pdf,
      },
    });

    this.logger.log(`Payment recorded for user ${userId}: ${invoice.amount_paid / 100} ${invoice.currency}`);
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    this.logger.log(`❌ Invoice payment failed: ${invoice.id}`);

    const userId = await this.getUserIdFromCustomer(invoice.customer);
    if (!userId) return;

    const subscription = await this.subscriptionsService.getSubscription(userId);

    // Registrar pago fallido
    await this.subscriptionsService.createPayment({
      userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      paymentMethod: PaymentMethod.STRIPE_CARD,
      status: PaymentStatus.FAILED,
      description: invoice.description || 'Subscription payment',
      stripePaymentIntentId: invoice.payment_intent,
      metadata: {
        invoiceId: invoice.id,
        failureReason: invoice.last_finalization_error?.message,
      },
    });

    // Actualizar estado de suscripción
    subscription.status = SubscriptionStatus.PAST_DUE;
    // await this.subscriptionsService.save(subscription);

    this.logger.log(`Payment failed for user ${userId}, subscription marked as PAST_DUE`);
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    this.logger.log(`✅ Payment succeeded: ${paymentIntent.id}`);

    const userId = await this.getUserIdFromCustomer(paymentIntent.customer);
    if (!userId) return;

    // Actualizar estado del pago si existe
    // TODO: Buscar payment por stripePaymentIntentId y actualizar
  }

  private async handlePaymentFailed(paymentIntent: any) {
    this.logger.log(`❌ Payment failed: ${paymentIntent.id}`);

    const userId = await this.getUserIdFromCustomer(paymentIntent.customer);
    if (!userId) return;

    // Actualizar estado del pago si existe
    // TODO: Buscar payment por stripePaymentIntentId y actualizar
  }

  // ==================== Helpers ====================

  private async findSubscriptionByStripeId(stripeSubscriptionId: string) {
    // TODO: Implementar búsqueda en base de datos
    // const subscription = await this.subscriptionsRepo.findOne({
    //   where: { stripeSubscriptionId },
    // });
    // return subscription;
    return null;
  }

  private async getUserIdFromCustomer(stripeCustomerId: string): Promise<string | null> {
    // TODO: Implementar búsqueda en base de datos
    // const subscription = await this.subscriptionsRepo.findOne({
    //   where: { stripeCustomerId },
    // });
    // return subscription?.userId || null;
    return null;
  }
}
