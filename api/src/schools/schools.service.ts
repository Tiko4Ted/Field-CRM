import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  create(createSchoolDto: CreateSchoolDto) {
    return this.prisma.school.create({ data: createSchoolDto as any });
  }

  findAll() {
    return this.prisma.school.findMany({
      include: { contacts: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.school.findUnique({
      where: { id },
      include: { contacts: true },
    });
  }

  update(id: string, updateSchoolDto: UpdateSchoolDto) {
    return this.prisma.school.update({
      where: { id },
      data: updateSchoolDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }
}
