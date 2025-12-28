import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Referral } from './referral.entity';

export enum PayoutStatus {
  PENDING = 'PENDING',       // Pendiente de procesamiento
  PROCESSING = 'PROCESSING', // En proceso
  COMPLETED = 'COMPLETED',   // Pagado exitosamente
  FAILED = 'FAILED',         // Falló el pago
  CANCELED = 'CANCELED',     // Cancelado
}

export enum PayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER', // Transferencia bancaria
  PAYPAL = 'PAYPAL',               // PayPal
  STRIPE = 'STRIPE',               // Stripe Connect
  MANUAL = 'MANUAL',               // Pago manual (efectivo, etc.)
}

@Entity('commission_payouts')
export class CommissionPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referralId: string;

  @ManyToOne(() => Referral)
  @JoinColumn({ name: 'referralId' })
  referral: Referral;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'MXN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @Column({
    type: 'enum',
    enum: PayoutMethod,
  })
  payoutMethod: PayoutMethod;

  // Período cubierto por este pago
  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  // Detalles del pago
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  transactionId: string; // ID de la transacción del banco/PayPal/etc.

  @Column({ nullable: true })
  receiptUrl: string; // URL del comprobante

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas internas

  // Metadata con desglose
  @Column({ type: 'jsonb', nullable: true })
  breakdown: {
    totalReferrals: number;
    activeReferrals: number;
    tier: string;
    commissionPercent: number;
    totalRevenue: number; // Ingresos totales de los referidos
    commissionAmount: number; // Comisión calculada
    fees?: number; // Comisiones de PayPal/banco
    netAmount?: number; // Monto neto pagado
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
