import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  visitedAt?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @IsOptional()
  @IsIn(['VISITED', 'FOLLOW_UP', 'BOOKED', 'CANCELLED'])
  status?: string;
}
