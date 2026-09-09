import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CampaignRole, CampaignMemberStatus, InvitationStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  // Owner creates a campaign
  async createCampaign(ownerId: string, data: { name: string; description: string }) {
    return this.prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.create({
        data: {
          name: data.name,
          description: data.description,
          ownerId,
        },
      });

      await tx.campaignMember.create({
        data: {
          campaignId: campaign.id,
          userId: ownerId,
          role: CampaignRole.OWNER,
          status: CampaignMemberStatus.ACTIVE,
        },
      });

      return campaign;
    });
  }

  // Get campaigns where the user is an active member
  async getMyCampaigns(userId: string) {
    return this.prisma.campaignMember.findMany({
      where: {
        userId,
        status: CampaignMemberStatus.ACTIVE,
      },
      include: {
        campaign: {
          include: {
            _count: {
              select: { members: true, intelligence: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async getCampaignDetails(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          where: { status: CampaignMemberStatus.ACTIVE },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  // Owner invites a user
  async inviteMember(campaignId: string, invitedById: string, email: string) {
    // Check if there is an active user or pending invitation
    const existingMember = await this.prisma.campaignMember.findFirst({
      where: { campaignId, user: { email }, status: CampaignMemberStatus.ACTIVE },
    });
    if (existingMember) throw new BadRequestException('User is already a member');

    const existingInvite = await this.prisma.campaignInvitation.findFirst({
      where: { campaignId, email, status: InvitationStatus.PENDING },
    });
    if (existingInvite) throw new BadRequestException('Invitation already pending for this email');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return this.prisma.campaignInvitation.create({
      data: {
        campaignId,
        email,
        invitedById,
        token,
        expiresAt,
      },
    });
  }

  // User accepts an invitation
  async acceptInvitation(userId: string, email: string, token: string) {
    return this.prisma.$transaction(async (tx) => {
      const invite = await tx.campaignInvitation.findUnique({ where: { token } });
      if (!invite || invite.email !== email || invite.status !== InvitationStatus.PENDING) {
        throw new BadRequestException('Invalid or expired invitation');
      }

      if (invite.expiresAt < new Date()) {
        await tx.campaignInvitation.update({
          where: { id: invite.id },
          data: { status: InvitationStatus.EXPIRED },
        });
        throw new BadRequestException('Invitation expired');
      }

      await tx.campaignInvitation.update({
        where: { id: invite.id },
        data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
      });

      // Check if they were previously a member and left/removed
      const existingMember = await tx.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId: invite.campaignId, userId } },
      });

      if (existingMember) {
        return tx.campaignMember.update({
          where: { id: existingMember.id },
          data: { status: CampaignMemberStatus.ACTIVE, role: CampaignRole.MEMBER },
        });
      }

      return tx.campaignMember.create({
        data: {
          campaignId: invite.campaignId,
          userId,
          role: CampaignRole.MEMBER,
          status: CampaignMemberStatus.ACTIVE,
        },
      });
    });
  }

  // Owner removes a member
  async removeMember(campaignId: string, memberUserId: string) {
    const membership = await this.prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId: memberUserId } },
    });
    if (!membership) throw new NotFoundException('Membership not found');
    if (membership.role === CampaignRole.OWNER) throw new BadRequestException('Cannot remove the owner');

    return this.prisma.campaignMember.update({
      where: { id: membership.id },
      data: { status: CampaignMemberStatus.REMOVED },
    });
  }

  // Member leaves a campaign
  async leaveCampaign(campaignId: string, userId: string) {
    const membership = await this.prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    });
    if (!membership) throw new NotFoundException('Membership not found');
    if (membership.role === CampaignRole.OWNER) throw new BadRequestException('Owner cannot leave the campaign');

    return this.prisma.campaignMember.update({
      where: { id: membership.id },
      data: { status: CampaignMemberStatus.LEFT },
    });
  }

  async getMembers(campaignId: string) {
    return this.prisma.campaignMember.findMany({
      where: { campaignId, status: CampaignMemberStatus.ACTIVE },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
