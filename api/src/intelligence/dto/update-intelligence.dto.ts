import { PartialType } from '@nestjs/mapped-types';
import { CreateIntelligenceDto } from './create-intelligence.dto.js';

export class UpdateIntelligenceDto extends PartialType(CreateIntelligenceDto) {}
