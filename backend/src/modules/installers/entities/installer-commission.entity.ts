import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CommissionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('installer_commissions')
export class InstallerCommission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'installer_id' })
  installerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'installer_id' })
  installer: User;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'subscription_plan' })
  subscriptionPlan: string;

  @Column({ name: 'subscription_amount', type: 'decimal', precision: 10, scale: 2 })
  subscriptionAmount: number;

  @Column({ name: 'commission_percentage', type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  commissionPercentage: number;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 20,
    default: CommissionStatus.PENDING,
  })
  paymentStatus: CommissionStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
