import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserGpsTraceDto {
  @IsString()
  @IsNotEmpty()
  gpsTraceUserId: string;
}
