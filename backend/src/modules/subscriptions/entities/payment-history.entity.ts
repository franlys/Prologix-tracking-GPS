import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Subscription } from './subscription.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  STRIPE_CARD = 'STRIPE_CARD',
  STRIPE_OXXO = 'STRIPE_OXXO',
  STRIPE_SPEI = 'STRIPE_SPEI',
  PAYPAL = 'PAYPAL',
  MANUAL = 'MANUAL', // Transferencia manual
}

@Entity('payment_history')
export class PaymentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  subscriptionId: string;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'MXN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  // Stripe/Payment provider info
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeChargeId: string;

  @Column({ nullable: true })
  stripeInvoiceId: string;

  // Detalles del pago
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  receiptUrl: string; // URL del recibo/factura

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    plan?: string;
    billingPeriod?: string;
    deviceCount?: number;
    discountApplied?: number;
    referralCode?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;
}
