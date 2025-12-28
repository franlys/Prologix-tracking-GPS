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

export enum ReferralTier {
  BRONZE = 'BRONZE',     // 1-20 clientes: 20% comisión
  SILVER = 'SILVER',     // 21-50 clientes: 25% comisión
  GOLD = 'GOLD',         // 51-100 clientes: 30% comisión
  DIAMOND = 'DIAMOND',   // 100+ clientes: 35% comisión
}

export enum ReferralStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // Instalador/Afiliado

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  referralCode: string; // Ej: PROLOGIX/JUAN123

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.ACTIVE,
  })
  status: ReferralStatus;

  @Column({
    type: 'enum',
    enum: ReferralTier,
    default: ReferralTier.BRONZE,
  })
  tier: ReferralTier;

  // Estadísticas
  @Column({ default: 0 })
  totalReferrals: number; // Total de clientes referidos

  @Column({ default: 0 })
  activeReferrals: number; // Clientes activos pagando

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number; // Total ganado histórico

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingEarnings: number; // Pendiente de pago

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidEarnings: number; // Ya pagado

  // Configuración de comisión
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  commissionPercent: number; // Porcentaje de comisión

  // Información del instalador
  @Column({ nullable: true })
  businessName: string; // Nombre del negocio

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  contactEmail: string;

  // Información de pago
  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankClabe: string; // CLABE interbancaria (México)

  @Column({ nullable: true })
  paypalEmail: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    taxId?: string; // RFC en México
    notes?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos helper
  getCommissionForTier(): number {
    const tierCommissions = {
      [ReferralTier.BRONZE]: 20,
      [ReferralTier.SILVER]: 25,
      [ReferralTier.GOLD]: 30,
      [ReferralTier.DIAMOND]: 35,
    };
    return tierCommissions[this.tier];
  }

  shouldUpgradeTier(): ReferralTier | null {
    if (this.activeReferrals >= 100 && this.tier !== ReferralTier.DIAMOND) {
      return ReferralTier.DIAMOND;
    }
    if (this.activeReferrals >= 51 && this.tier === ReferralTier.SILVER) {
      return ReferralTier.GOLD;
    }
    if (this.activeReferrals >= 21 && this.tier === ReferralTier.BRONZE) {
      return ReferralTier.SILVER;
    }
    return null;
  }
}
