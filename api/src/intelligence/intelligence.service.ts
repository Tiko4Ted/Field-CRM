import { Injectable } from '@nestjs/common';
import { CreateIntelligenceDto } from './dto/create-intelligence.dto.js';
import { UpdateIntelligenceDto } from './dto/update-intelligence.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

  create(createIntelligenceDto: CreateIntelligenceDto) {
    return this.prisma.intelligence.create({ data: createIntelligenceDto as any });
  }

  findAll() {
    return this.prisma.intelligence.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.intelligence.findUnique({
      where: { id },
    });
  }

  update(id: string, updateIntelligenceDto: UpdateIntelligenceDto) {
    return this.prisma.intelligence.update({
      where: { id },
      data: updateIntelligenceDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.intelligence.delete({ where: { id } });
  }
}
