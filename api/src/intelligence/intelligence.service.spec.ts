import { Test, TestingModule } from '@nestjs/testing';
import { IntelligenceService } from './intelligence.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CampaignRole, CampaignMemberStatus, IntelligenceReviewStatus } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';

describe('IntelligenceService Authorization', () => {
  let service: IntelligenceService;
  let prisma: PrismaService;

  const mockPrisma = {
    intelligence: {
      findUnique: vi.fn(),
    },
    campaignMember: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntelligenceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<IntelligenceService>(IntelligenceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findOne', () => {
    const campaignId = 'campaign-1';
    const intelligenceId = 'intel-1';

    const mockIntelligence = (recordedById: string, campId: string | null = campaignId) => ({
      id: intelligenceId,
      campaignId: campId,
      recordedById,
      name: 'Test School',
      reviewStatus: IntelligenceReviewStatus.PENDING_REVIEW,
    });

    it('Member can retrieve own intelligence', async () => {
      const userId = 'user-1';
      mockPrisma.intelligence.findUnique.mockResolvedValue(mockIntelligence(userId));
      mockPrisma.campaignMember.findUnique.mockResolvedValue({
        role: CampaignRole.MEMBER,
        status: CampaignMemberStatus.ACTIVE,
      });

      const result = await service.findOne(userId, intelligenceId);
      expect(result.id).toBe(intelligenceId);
    });

    it('Member cannot retrieve another member\'s intelligence even if they know its ID', async () => {
      const userId = 'user-1';
      const otherUserId = 'user-2';
      mockPrisma.intelligence.findUnique.mockResolvedValue(mockIntelligence(otherUserId));
      mockPrisma.campaignMember.findUnique.mockResolvedValue({
        role: CampaignRole.MEMBER,
        status: CampaignMemberStatus.ACTIVE,
      });

      await expect(service.findOne(userId, intelligenceId)).rejects.toThrow(ForbiddenException);
    });

    it('Owner can retrieve all campaign intelligence', async () => {
      const ownerId = 'user-1';
      const otherUserId = 'user-2';
      mockPrisma.intelligence.findUnique.mockResolvedValue(mockIntelligence(otherUserId));
      mockPrisma.campaignMember.findUnique.mockResolvedValue({
        role: CampaignRole.OWNER,
        status: CampaignMemberStatus.ACTIVE,
      });

      const result = await service.findOne(ownerId, intelligenceId);
      expect(result.id).toBe(intelligenceId);
    });

    it('Non-member cannot access the campaign intelligence', async () => {
      const userId = 'user-1';
      mockPrisma.intelligence.findUnique.mockResolvedValue(mockIntelligence('user-2'));
      mockPrisma.campaignMember.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, intelligenceId)).rejects.toThrow(ForbiddenException);
    });

    it('REMOVED/LEFT members cannot access the campaign intelligence', async () => {
      const userId = 'user-1';
      mockPrisma.intelligence.findUnique.mockResolvedValue(mockIntelligence(userId));
      
      // Test REMOVED
      mockPrisma.campaignMember.findUnique.mockResolvedValue({
        role: CampaignRole.MEMBER,
        status: CampaignMemberStatus.REMOVED,
      });
      await expect(service.findOne(userId, intelligenceId)).rejects.toThrow(ForbiddenException);

      // Test LEFT
      mockPrisma.campaignMember.findUnique.mockResolvedValue({
        role: CampaignRole.MEMBER,
        status: CampaignMemberStatus.LEFT,
      });
      await expect(service.findOne(userId, intelligenceId)).rejects.toThrow(ForbiddenException);
    });

    it('Personal intelligence can only be accessed by the creator', async () => {
      const userId = 'user-1';
      mockPrisma.intelligence.findUnique.mockResolvedValue(mockIntelligence(userId, null)); // No campaign

      const result = await service.findOne(userId, intelligenceId);
      expect(result.id).toBe(intelligenceId);

      // Another user trying to access it
      const otherUserId = 'user-2';
      await expect(service.findOne(otherUserId, intelligenceId)).rejects.toThrow(ForbiddenException);
    });
  });
});
