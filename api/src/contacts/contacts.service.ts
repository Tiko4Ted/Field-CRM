import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(createContactDto: CreateContactDto) {
    return this.prisma.contact.create({ data: createContactDto as any });
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
    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
