import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { InvitationStatus, CampaignMemberStatus, CampaignRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  }

  async profile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async register(data: { email: string; password: string; name: string }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltOrRounds);

    const user = await this.usersService.create({
      email: data.email,
      passwordHash,
      name: data.name,
    });

    // Auto-accept any pending campaign invitations for this email
    await this.autoAcceptInvitations(user.id, data.email);

    const { passwordHash: _, ...result } = user;
    return this.login(result);
  }

  /**
   * After a new user registers, check for any pending campaign invitations
   * for their email address and automatically accept them all.
   * No token link required — their email is their identity.
   */
  private async autoAcceptInvitations(userId: string, email: string) {
    const pendingInvitations = await this.prisma.campaignInvitation.findMany({
      where: { email, status: InvitationStatus.PENDING },
    });

    if (pendingInvitations.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      for (const invite of pendingInvitations) {
        // Skip expired invitations
        if (invite.expiresAt < new Date()) {
          await tx.campaignInvitation.update({
            where: { id: invite.id },
            data: { status: InvitationStatus.EXPIRED },
          });
          continue;
        }

        // Mark invitation accepted
        await tx.campaignInvitation.update({
          where: { id: invite.id },
          data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
        });

        // Create the campaign member record
        const existingMember = await tx.campaignMember.findUnique({
          where: { campaignId_userId: { campaignId: invite.campaignId, userId } },
        });

        if (existingMember) {
          await tx.campaignMember.update({
            where: { id: existingMember.id },
            data: { status: CampaignMemberStatus.ACTIVE, role: CampaignRole.MEMBER },
          });
        } else {
          await tx.campaignMember.create({
            data: {
              campaignId: invite.campaignId,
              userId,
              role: CampaignRole.MEMBER,
              status: CampaignMemberStatus.ACTIVE,
            },
          });
        }
      }
    });
  }
}
