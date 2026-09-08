import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolDto } from './create-school.dto.js';

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {}
