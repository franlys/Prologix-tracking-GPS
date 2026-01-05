import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'El comando SMS no puede exceder 200 caracteres' })
  command: string;
}
