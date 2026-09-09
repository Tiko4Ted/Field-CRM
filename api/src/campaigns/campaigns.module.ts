import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service.js';
import { CampaignsController } from './campaigns.controller.js';

@Module({
  providers: [CampaignsService],
  controllers: [CampaignsController]
})
export class CampaignsModule {}
