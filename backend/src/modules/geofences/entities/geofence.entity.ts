import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GeofenceType {
  CIRCLE = 'CIRCLE',
  POLYGON = 'POLYGON',
}

@Entity('geofences')
@Index(['userId', 'isActive'])
export class Geofence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GeofenceType,
    default: GeofenceType.CIRCLE,
  })
  type: GeofenceType;

  // For CIRCLE type
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'int', default: 100 })
  radiusMeters: number;

  // For POLYGON type (array of coordinates)
  @Column({ type: 'jsonb', nullable: true })
  polygon: { lat: number; lng: number }[];

  // Alert settings
  @Column({ default: true })
  alertOnEnter: boolean;

  @Column({ default: true })
  alertOnExit: boolean;

  @Column({ default: true })
  isActive: boolean;

  // Optional: Color for map display
  @Column({ default: '#3B82F6' })
  color: string;

  // Optional: Link to specific device (null = all user's devices)
  @Column({ nullable: true })
  deviceId: string;

  // Optional: Traccar geofence ID if synced
  @Column({ type: 'int', nullable: true })
  traccarGeofenceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
