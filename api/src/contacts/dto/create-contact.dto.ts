import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  role: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsString()
  @MinLength(1)
  schoolId: string;
}
