import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from './campaigns.controller.js';
import { CampaignsService } from './campaigns.service.js';
import { CampaignRoleGuard } from './campaign-role.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

describe('CampaignsController', () => {
  let controller: CampaignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: {
            createCampaign: vi.fn(),
            getMyCampaigns: vi.fn(),
            acceptInvitation: vi.fn(),
            getCampaignDetails: vi.fn(),
            getMembers: vi.fn(),
            inviteMember: vi.fn(),
            removeMember: vi.fn(),
            leaveCampaign: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CampaignRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CampaignsController>(CampaignsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
