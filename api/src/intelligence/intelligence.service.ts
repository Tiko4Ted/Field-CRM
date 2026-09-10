import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntelligenceDto } from './dto/create-intelligence.dto.js';
import { UpdateIntelligenceDto } from './dto/update-intelligence.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CampaignRole, CampaignMemberStatus } from '@prisma/client';

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

  private normalizeOptionalFields<T extends Record<string, any>>(dto: T): T {
    const nullableTextFields = [
      'source',
      'intell',
      'bestTimeToVisit',
      'location',
      'estimatedStudents',
      'schoolType',
      'hasSystem',
    ];

    return nullableTextFields.reduce(
      (normalized, field) => ({
        ...normalized,
        [field]: typeof normalized[field] === 'string' && normalized[field].trim() === '' ? null : normalized[field],
      }),
      { ...dto },
    );
  }

  private validateStatusTransition(currentStatus: string, nextStatus: string, bookedDate?: string | null) {
    if (currentStatus === nextStatus) return;

    const allowedTransitions: Record<string, string[]> = {
      PLANNED: ['VISITED', 'CANCELLED'],
      VISITED: ['BOOKED'],
      BOOKED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
      throw new BadRequestException(`Cannot move intelligence from ${currentStatus} to ${nextStatus}.`);
    }

    if (nextStatus === 'BOOKED' && !bookedDate) {
      throw new BadRequestException('A booked intelligence record requires a bookedDate.');
    }
  }

  // Helper to check access and return a valid where clause segment
  private async getAccessScope(userId: string, campaignId?: string) {
    if (!campaignId) {
      // Personal intelligence
      return { campaignId: null, recordedById: userId };
    }

    // Campaign intelligence
    const membership = await this.prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    });

    if (!membership || membership.status !== CampaignMemberStatus.ACTIVE) {
      throw new ForbiddenException('You do not have access to this campaign');
    }

    if (membership.role === CampaignRole.OWNER) {
      return { campaignId };
    } else {
      // MEMBER role
      return { campaignId, recordedById: userId };
    }
  }

  async create(userId: string, dto: CreateIntelligenceDto & { campaignId?: string }) {
    // If creating for a campaign, verify they are an active member
    if (dto.campaignId) {
      const membership = await this.prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId: dto.campaignId, userId } },
      });
      if (!membership || membership.status !== CampaignMemberStatus.ACTIVE) {
        throw new ForbiddenException('Cannot create intelligence for a campaign you are not an active member of');
      }
    }

    const data = this.normalizeOptionalFields(dto);

    return this.prisma.intelligence.create({
      data: {
        ...data,
        recordedById: userId,
        campaignId: data.campaignId || null,
        plannedVisitDate: data.plannedVisitDate ? new Date(data.plannedVisitDate) : undefined,
        bookedDate: data.bookedDate ? new Date(data.bookedDate) : undefined,
      } as any,
    });
  }

  async findAll(userId: string, search?: string, campaignId?: string) {
    const scope = await this.getAccessScope(userId, campaignId);
    const normalizedSearch = search?.trim();

    return this.prisma.intelligence.findMany({
      where: {
        ...scope,
        ...(normalizedSearch
          ? {
              OR: [
                { name: { contains: normalizedSearch, mode: 'insensitive' } },
                { source: { contains: normalizedSearch, mode: 'insensitive' } },
                { intell: { contains: normalizedSearch, mode: 'insensitive' } },
                { location: { contains: normalizedSearch, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const record = await this.prisma.intelligence.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');

    const scope = await this.getAccessScope(userId, record.campaignId || undefined);
    
    // Validate record matches scope (owner can see all in campaign, member only theirs)
    if (scope.recordedById && record.recordedById !== scope.recordedById) {
      throw new ForbiddenException('You do not have access to this record');
    }
    if (scope.campaignId === null && record.campaignId !== null) {
        throw new ForbiddenException('You do not have access to this record');
    }

    return record;
  }

  async update(userId: string, id: string, dto: UpdateIntelligenceDto) {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.intelligence.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('Record not found');

      // Only the recorded user can update their record
      // An owner reviewing/flagging will be a different endpoint
      if (record.recordedById !== userId) {
        throw new ForbiddenException('You can only update intelligence you recorded');
      }

      if (dto.status) {
        this.validateStatusTransition(record.status, dto.status, dto.bookedDate);
      }

      const data = this.normalizeOptionalFields(dto);

      return tx.intelligence.update({
        where: { id },
        data: {
          ...data,
          plannedVisitDate: data.plannedVisitDate ? new Date(data.plannedVisitDate) : data.plannedVisitDate,
          bookedDate: data.bookedDate ? new Date(data.bookedDate) : data.bookedDate,
        } as any,
      });
    });
  }

  async remove(userId: string, id: string) {
    const record = await this.prisma.intelligence.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');

    if (record.recordedById !== userId) {
      throw new ForbiddenException('You can only delete intelligence you recorded');
    }

    return this.prisma.intelligence.delete({ where: { id } });
  }
}
