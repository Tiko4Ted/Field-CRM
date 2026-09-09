import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CampaignsService } from './campaigns.service.js';
import { CampaignsController } from './campaigns.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [CampaignsService],
  controllers: [CampaignsController]
})
export class CampaignsModule {}
