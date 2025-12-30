import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('gps_positions')
@Index(['deviceId', 'timestamp']) // Optimize queries by device and time
@Index(['userId', 'timestamp']) // Optimize queries by user and time
@Index(['timestamp']) // Optimize cleanup queries
export class GpsPosition {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // Device identification
  @Column({ name: 'device_id', type: 'varchar', length: 100 })
  @Index()
  deviceId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  // Position data
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  altitude: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  speed: number; // km/h

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  course: number; // degrees (0-360)

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  accuracy: number; // meters

  // Timestamps
  @Column({ type: 'timestamp with time zone' })
  @Index()
  timestamp: Date; // Device timestamp (when GPS recorded it)

  @CreateDateColumn({ name: 'server_time', type: 'timestamp with time zone' })
  serverTime: Date; // Server timestamp (when we received it)

  // Additional data
  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'battery_level', type: 'int', nullable: true })
  batteryLevel: number; // 0-100

  @Column({ type: 'int', nullable: true })
  satellites: number; // Number of satellites

  @Column({ type: 'boolean', nullable: true })
  ignition: boolean;

  @Column({ type: 'boolean', nullable: true })
  motion: boolean;

  @Column({ type: 'boolean', nullable: true })
  charge: boolean;

  // Network/Signal
  @Column({ type: 'int', nullable: true })
  rssi: number; // Signal strength

  // Distance tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance: number; // Distance from last position (km)

  @Column({ name: 'total_distance', type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalDistance: number; // Total odometer (km)

  // Metadata
  @Column({ type: 'varchar', length: 50, nullable: true })
  protocol: string; // concox, teltonika, etc.

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>; // Additional attributes from GPS device

  // Unique constraint to prevent duplicate positions
  @Column({ unique: false })
  @Index(['deviceId', 'timestamp'], { unique: true })
  private _uniqueConstraint?: string;
}
