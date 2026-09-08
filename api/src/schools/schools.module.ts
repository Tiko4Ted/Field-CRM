import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service.js';
import { SchoolsController } from './schools.controller.js';

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsService],
})
export class SchoolsModule {}
