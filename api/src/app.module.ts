import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SchoolsModule } from './schools/schools.module.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { IntelligenceModule } from './intelligence/intelligence.module.js';

@Module({
  imports: [SchoolsModule, ContactsModule, PrismaModule, IntelligenceModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
