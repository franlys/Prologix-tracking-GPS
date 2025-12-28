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

export enum NotificationType {
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  SPEED_EXCEEDED = 'SPEED_EXCEEDED',
  GEOFENCE_ENTER = 'GEOFENCE_ENTER',
  GEOFENCE_EXIT = 'GEOFENCE_EXIT',
  LOW_BATTERY = 'LOW_BATTERY',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  BOTH = 'BOTH',
}

@Entity('notification_rules')
export class NotificationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  deviceId: string; // null = applies to all user's devices

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.BOTH,
  })
  channel: NotificationChannel;

  @Column({ default: true })
  isActive: boolean;

  // Configuration specific to notification type
  @Column({ type: 'jsonb', nullable: true })
  config: {
    speedLimit?: number; // For SPEED_EXCEEDED
    offlineMinutes?: number; // For DEVICE_OFFLINE
    geofence?: {
      // For GEOFENCE_ENTER/EXIT
      lat: number;
      lng: number;
      radiusMeters: number;
    };
    batteryPercent?: number; // For LOW_BATTERY
  };

  // Cooldown to prevent spam
  @Column({ default: 300 }) // 5 minutes default
  cooldownSeconds: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
