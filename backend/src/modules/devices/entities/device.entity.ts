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

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING', // Instalado pero no configurado aún
}

export enum DeviceType {
  COBAN_303 = 'COBAN_303',
  COBAN_GPS103 = 'COBAN_GPS103',
  GT06 = 'GT06',
  TK103 = 'TK103',
  OTHER = 'OTHER',
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // IMEI del dispositivo GPS (único)
  @Column({ unique: true })
  imei: string;

  // Nombre descriptivo del dispositivo
  @Column()
  name: string;

  // Número de teléfono SIM (para recargas de internet)
  @Column({ nullable: true })
  simNumber: string;

  // Operadora de la SIM (Claro, Altice, etc.)
  @Column({ nullable: true })
  simCarrier: string;

  // Fecha de vencimiento de la recarga
  @Column({ type: 'timestamp', nullable: true })
  simExpirationDate: Date;

  // Tipo/modelo del dispositivo GPS
  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.OTHER,
  })
  deviceType: DeviceType;

  // Estado del dispositivo
  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.PENDING,
  })
  status: DeviceStatus;

  // ID del dispositivo en Traccar (se asigna cuando se registra en Traccar)
  @Column({ nullable: true })
  traccarDeviceId: string;

  // Usuario dueño del dispositivo
  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // Instalador que instaló el dispositivo
  @Column({ name: 'installer_id', nullable: true })
  installerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'installer_id' })
  installer: User;

  // Descripción del vehículo (ej: "Toyota Corolla 2020 Rojo")
  @Column({ nullable: true })
  vehicleDescription: string;

  // Placa del vehículo
  @Column({ nullable: true })
  vehiclePlate: string;

  // Notas adicionales
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Fecha de instalación
  @Column({ type: 'timestamp', nullable: true })
  installedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
