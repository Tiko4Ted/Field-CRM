import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIntelligenceDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  source?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  intell?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  bestTimeToVisit?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  location?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  estimatedStudents?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value || null : value))
  @IsOptional()
  @IsIn(['Private', 'Public'])
  schoolType?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value || null : value))
  @IsOptional()
  @IsIn(['Yes', 'No', 'Unknown'])
  hasSystem?: string | null;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsDateString()
  plannedVisitDate?: string | null;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsDateString()
  bookedDate?: string | null;

  @IsOptional()
  @IsIn(['PLANNED', 'VISITED', 'BOOKED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;
}
