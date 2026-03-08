import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Geofence } from './geofence.entity';

@Entity('geofence_states')
@Unique(['geofenceId', 'deviceId'])
@Index(['deviceId', 'geofenceId'])
export class GeofenceState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  geofenceId: string;

  @ManyToOne(() => Geofence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'geofenceId' })
  geofence: Geofence;

  @Column()
  deviceId: string;

  @Column({ default: false })
  isInside: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastEnteredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastExitedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lastLongitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
