import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { IntelligenceService } from './intelligence.service.js';
import { IntelligenceController } from './intelligence.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [IntelligenceController],
  providers: [IntelligenceService],
})
export class IntelligenceModule {}
