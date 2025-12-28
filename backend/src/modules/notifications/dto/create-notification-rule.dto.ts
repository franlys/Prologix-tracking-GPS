import { IsEnum, IsOptional, IsNumber, IsBoolean, IsObject, IsString, Min } from 'class-validator';
import { NotificationType, NotificationChannel } from '../entities/notification-rule.entity';

export class CreateNotificationRuleDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  config?: {
    speedLimit?: number;
    offlineMinutes?: number;
    geofence?: {
      lat: number;
      lng: number;
      radiusMeters: number;
    };
    batteryPercent?: number;
  };

  @IsOptional()
  @IsNumber()
  @Min(60) // At least 1 minute cooldown
  cooldownSeconds?: number;
}
