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

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASICO = 'BASICO',
  PROFESIONAL = 'PROFESIONAL',
  EMPRESARIAL = 'EMPRESARIAL',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  TRIALING = 'TRIALING',
  INCOMPLETE = 'INCOMPLETE',
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.MONTHLY,
  })
  billingPeriod: BillingPeriod;

  // Límites por plan
  @Column({ default: 3 }) // FREE: 3, BASICO: 10, PROFESIONAL: 50, EMPRESARIAL: ilimitado
  maxDevices: number;

  @Column({ default: 5 }) // FREE: 5, BASICO: 20, PROFESIONAL: ilimitado
  maxGeofences: number;

  @Column({ default: 1 }) // FREE: 1, BASICO: 5, PROFESIONAL: 20, EMPRESARIAL: ilimitado
  maxSharedUsers: number;

  @Column({ default: 7 }) // FREE: 7 días, BASICO: 30, PROFESIONAL: 90, EMPRESARIAL: ilimitado
  historyRetentionDays: number;

  // Características habilitadas
  @Column({ default: false })
  whatsappNotifications: boolean;

  @Column({ default: false })
  advancedReports: boolean;

  @Column({ default: false })
  apiAccess: boolean;

  @Column({ default: false })
  whiteLabel: boolean;

  @Column({ default: false })
  driverManagement: boolean;

  @Column({ default: false })
  fuelManagement: boolean;

  @Column({ default: false })
  predictiveMaintenance: boolean;

  @Column({ default: false })
  remoteControl: boolean;

  @Column({ default: false })
  aiPredictions: boolean;

  @Column({ default: false })
  dashcamCloud: boolean;

  // Stripe/Payment info
  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  stripePriceId: string;

  // Fechas
  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Descuentos y promociones
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number; // 0-100

  @Column({ nullable: true })
  couponCode: string;

  // Programa de afiliados
  @Column({ nullable: true })
  referredBy: string; // instaladorId o referral code

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  referralCommissionPercent: number; // Comisión del instalador

  // Métodos helper
  isFeatureEnabled(feature: string): boolean {
    return this[feature] === true;
  }

  canAddDevice(currentDeviceCount: number): boolean {
    if (this.plan === SubscriptionPlan.EMPRESARIAL) {
      return true; // Ilimitado
    }
    return currentDeviceCount < this.maxDevices;
  }

  canAddGeofence(currentGeofenceCount: number): boolean {
    if (this.plan === SubscriptionPlan.PROFESIONAL || this.plan === SubscriptionPlan.EMPRESARIAL) {
      return true; // Ilimitado
    }
    return currentGeofenceCount < this.maxGeofences;
  }

  canShareWith(currentSharedUsersCount: number): boolean {
    if (this.plan === SubscriptionPlan.EMPRESARIAL) {
      return true; // Ilimitado
    }
    return currentSharedUsersCount < this.maxSharedUsers;
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE || this.status === SubscriptionStatus.TRIALING;
  }

  isInTrial(): boolean {
    return this.status === SubscriptionStatus.TRIALING && this.trialEndsAt && new Date() < this.trialEndsAt;
  }
}
