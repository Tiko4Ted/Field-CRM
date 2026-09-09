import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CampaignRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('campaignRoles', context.getHandler());
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // campaignId can be in params (e.g. /campaigns/:campaignId)
    // or in body (e.g. creating intelligence)
    const campaignId = request.params.campaignId || request.body.campaignId;

    if (!user) {
      return false; // JWT guard should have caught this
    }

    if (!campaignId) {
      // If no campaignId is found, we might be creating a personal intelligence, so allow it.
      // But if we specifically require roles, it means it's a campaign route.
      if (requiredRoles && requiredRoles.length > 0) {
        throw new NotFoundException('Campaign ID not provided');
      }
      return true;
    }

    const membership = await this.prisma.campaignMember.findUnique({
      where: {
        campaignId_userId: {
          campaignId,
          userId: user.id,
        },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not an active member of this campaign');
    }

    // Attach membership to the request for the controller to use
    request.campaignMembership = membership;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(`Require one of the following roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}

import { SetMetadata } from '@nestjs/common';
export const RequireCampaignRoles = (...roles: string[]) => SetMetadata('campaignRoles', roles);
