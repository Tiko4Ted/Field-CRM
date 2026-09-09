import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntelligenceDto } from './dto/create-intelligence.dto.js';
import { UpdateIntelligenceDto } from './dto/update-intelligence.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CampaignRole, CampaignMemberStatus } from '@prisma/client';

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.intelligence.create({
      data: {
        ...dto,
        recordedById: userId,
        campaignId: dto.campaignId || null,
        plannedVisitDate: dto.plannedVisitDate ? new Date(dto.plannedVisitDate) : undefined,
        bookedDate: dto.bookedDate ? new Date(dto.bookedDate) : undefined,
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

      return tx.intelligence.update({
        where: { id },
        data: {
          ...dto,
          plannedVisitDate: dto.plannedVisitDate ? new Date(dto.plannedVisitDate) : dto.plannedVisitDate,
          bookedDate: dto.bookedDate ? new Date(dto.bookedDate) : dto.bookedDate,
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
