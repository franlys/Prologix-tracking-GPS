import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GeofenceType } from '../entities/geofence.entity';

class PolygonPointDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class CreateGeofenceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(GeofenceType)
  type?: GeofenceType;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100000)
  radiusMeters?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolygonPointDto)
  polygon?: PolygonPointDto[];

  @IsOptional()
  @IsBoolean()
  alertOnEnter?: boolean;

  @IsOptional()
  @IsBoolean()
  alertOnExit?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
