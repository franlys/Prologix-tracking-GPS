import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  INSTALLER = 'INSTALLER',
  ADMIN = 'ADMIN',
}

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PLUS = 'PLUS',
  PRO = 'PRO',
}

export enum GpsProvider {
  GPS_TRACE = 'GPS_TRACE',
  TRACCAR = 'TRACCAR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({ nullable: true })
  gpsTraceUserId: string;

  @Column({ nullable: true })
  traccarUserId: string;

  @Column({
    type: 'enum',
    enum: GpsProvider,
    default: GpsProvider.GPS_TRACE,
  })
  gpsProvider: GpsProvider;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
