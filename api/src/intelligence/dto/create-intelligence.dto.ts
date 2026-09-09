import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateIntelligenceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  source: string;

  @IsString()
  @MinLength(1)
  intell: string;

  @IsString()
  @MinLength(1)
  bestTimeToVisit: string;

  @IsString()
  @MinLength(1)
  location: string;

  @IsOptional()
  @IsString()
  estimatedStudents?: string;

  @IsOptional()
  @IsIn(['Private', 'Public'])
  schoolType?: string;

  @IsOptional()
  @IsIn(['Yes', 'No', 'Unknown'])
  hasSystem?: string;

  @IsOptional()
  @IsDateString()
  plannedVisitDate?: string;

  @IsOptional()
  @IsDateString()
  bookedDate?: string;

  @IsOptional()
  @IsIn(['PLANNED', 'VISITED', 'BOOKED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;
}
