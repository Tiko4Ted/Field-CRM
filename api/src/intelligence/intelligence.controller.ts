import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service.js';
import { CreateIntelligenceDto } from './dto/create-intelligence.dto.js';
import { UpdateIntelligenceDto } from './dto/update-intelligence.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
  };
}

@Controller('intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() createIntelligenceDto: CreateIntelligenceDto) {
    return this.intelligenceService.create(req.user.id, createIntelligenceDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest, @Query('search') search?: string, @Query('campaignId') campaignId?: string) {
    return this.intelligenceService.findAll(req.user.id, search, campaignId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.intelligenceService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() updateIntelligenceDto: UpdateIntelligenceDto) {
    return this.intelligenceService.update(req.user.id, id, updateIntelligenceDto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.intelligenceService.remove(req.user.id, id);
  }
}
