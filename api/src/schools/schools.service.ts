import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  create(createSchoolDto: CreateSchoolDto) {
    return this.prisma.school.create({
      data: {
        ...createSchoolDto,
        visitedAt: createSchoolDto.visitedAt ? new Date(createSchoolDto.visitedAt) : undefined,
        followUpDate: createSchoolDto.followUpDate ? new Date(createSchoolDto.followUpDate) : undefined,
      } as any,
    });
  }

  findAll(search?: string) {
    const normalizedSearch = search?.trim();

    return this.prisma.school.findMany({
      where: normalizedSearch
        ? {
            OR: [
              { name: { contains: normalizedSearch, mode: 'insensitive' } },
              { notes: { contains: normalizedSearch, mode: 'insensitive' } },
              { followUpNotes: { contains: normalizedSearch, mode: 'insensitive' } },
              {
                contacts: {
                  some: {
                    OR: [
                      { name: { contains: normalizedSearch, mode: 'insensitive' } },
                      { role: { contains: normalizedSearch, mode: 'insensitive' } },
                      { phone: { contains: normalizedSearch, mode: 'insensitive' } },
                      { notes: { contains: normalizedSearch, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : undefined,
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
      data: {
        ...updateSchoolDto,
        visitedAt: updateSchoolDto.visitedAt ? new Date(updateSchoolDto.visitedAt) : undefined,
        followUpDate: updateSchoolDto.followUpDate ? new Date(updateSchoolDto.followUpDate) : undefined,
      } as any,
    });
  }

  remove(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }
}
