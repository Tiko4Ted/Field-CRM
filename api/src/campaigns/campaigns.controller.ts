import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { CampaignsService } from './campaigns.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CampaignRoleGuard, RequireCampaignRoles } from './campaign-role.guard.js';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  createCampaign(@Req() req, @Body() body: { name: string; description: string }) {
    return this.campaignsService.createCampaign(req.user.id, body);
  }

  @Get()
  getMyCampaigns(@Req() req) {
    return this.campaignsService.getMyCampaigns(req.user.id);
  }

  @Post('invitations/accept')
  acceptInvitation(@Req() req, @Body() body: { token: string }) {
    return this.campaignsService.acceptInvitation(req.user.id, req.user.email, body.token);
  }

  // Protected by CampaignRoleGuard but ANY role can access
  @Get(':campaignId')
  @UseGuards(CampaignRoleGuard)
  getCampaignDetails(@Param('campaignId') campaignId: string) {
    return this.campaignsService.getCampaignDetails(campaignId);
  }

  // Protected by CampaignRoleGuard - ONLY OWNER
  @Get(':campaignId/members')
  @UseGuards(CampaignRoleGuard)
  @RequireCampaignRoles('OWNER')
  getMembers(@Param('campaignId') campaignId: string) {
    return this.campaignsService.getMembers(campaignId);
  }

  @Post(':campaignId/invitations')
  @UseGuards(CampaignRoleGuard)
  @RequireCampaignRoles('OWNER')
  inviteMember(@Req() req, @Param('campaignId') campaignId: string, @Body() body: { email: string }) {
    return this.campaignsService.inviteMember(campaignId, req.user.id, body.email);
  }

  @Delete(':campaignId/members/:memberId')
  @UseGuards(CampaignRoleGuard)
  @RequireCampaignRoles('OWNER')
  removeMember(@Param('campaignId') campaignId: string, @Param('memberId') memberId: string) {
    return this.campaignsService.removeMember(campaignId, memberId);
  }

  @Post(':campaignId/leave')
  @UseGuards(CampaignRoleGuard)
  leaveCampaign(@Req() req, @Param('campaignId') campaignId: string) {
    return this.campaignsService.leaveCampaign(campaignId, req.user.id);
  }
}
