import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SchoolsModule } from './schools/schools.module.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { IntelligenceModule } from './intelligence/intelligence.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CampaignsModule } from './campaigns/campaigns.module.js';

@Module({
  imports: [SchoolsModule, ContactsModule, PrismaModule, IntelligenceModule, UsersModule, AuthModule, CampaignsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
