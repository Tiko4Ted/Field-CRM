import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(createContactDto: CreateContactDto) {
    return this.prisma.$transaction(async (tx) => {
      if (createContactDto.isPrimary) {
        await tx.contact.updateMany({
          where: { schoolId: createContactDto.schoolId },
          data: { isPrimary: false },
        });
      }

      return tx.contact.create({ data: createContactDto as any });
    });
  }

  findAll() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  update(id: string, updateContactDto: UpdateContactDto) {
    return this.prisma.$transaction(async (tx) => {
      if (updateContactDto.isPrimary) {
        const existing = await tx.contact.findUniqueOrThrow({
          where: { id },
          select: { schoolId: true },
        });
        const schoolId = updateContactDto.schoolId ?? existing.schoolId;

        await tx.contact.updateMany({
          where: { schoolId, NOT: { id } },
          data: { isPrimary: false },
        });
      }

      return tx.contact.update({
        where: { id },
        data: updateContactDto as any,
      });
    });
  }

  remove(id: string) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
