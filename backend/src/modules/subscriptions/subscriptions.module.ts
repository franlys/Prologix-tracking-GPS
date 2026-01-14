import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { WebhooksController } from './webhooks.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { StripeService } from './services/stripe.service';
// PayPalService temporalmente deshabilitado
// import { PayPalService } from './services/paypal.service';
import { Subscription } from './entities/subscription.entity';
import { PaymentHistory } from './entities/payment-history.entity';
import { Referral } from './entities/referral.entity';
import { CommissionPayout } from './entities/commission-payout.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      PaymentHistory,
      Referral,
      CommissionPayout,
      User,
    ]),
  ],
  controllers: [SubscriptionsController, WebhooksController],
  providers: [SubscriptionsService, StripeService],
  exports: [SubscriptionsService, StripeService],
})
export class SubscriptionsModule {}
