import { IsString, IsOptional, IsEnum, IsDateString, Matches, Length } from 'class-validator';
import { DeviceType } from '../entities/device.entity';

export class CreateDeviceDto {
  @IsString()
  @Length(15, 15, { message: 'IMEI debe tener exactamente 15 dígitos' })
  @Matches(/^\d{15}$/, { message: 'IMEI debe contener solo números' })
  imei: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  simNumber?: string;

  @IsOptional()
  @IsString()
  simCarrier?: string;

  @IsOptional()
  @IsDateString()
  simExpirationDate?: string;

  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @IsOptional()
  @IsString()
  ownerEmail?: string; // Email del cliente dueño del dispositivo

  @IsOptional()
  @IsString()
  vehicleDescription?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsString()
  simNumber?: string;

  @IsOptional()
  @IsString()
  simCarrier?: string;

  @IsOptional()
  @IsDateString()
  simExpirationDate?: string;

  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @IsOptional()
  @IsString()
  vehicleDescription?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignDeviceDto {
  @IsString()
  ownerEmail: string; // Email del nuevo dueño
}
