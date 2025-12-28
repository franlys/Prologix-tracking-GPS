import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetHistoryDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
