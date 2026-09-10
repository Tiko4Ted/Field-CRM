import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CampaignMemberStatus, CampaignRole, InvitationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let jwtService: {
    sign: ReturnType<typeof vi.fn>;
  };
  let prisma: {
    campaignInvitation: {
      findMany: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let transaction: {
    campaignInvitation: {
      update: ReturnType<typeof vi.fn>;
    };
    campaignMember: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };
    jwtService = {
      sign: vi.fn().mockReturnValue('signed-token'),
    };
    transaction = {
      campaignInvitation: {
        update: vi.fn(),
      },
      campaignMember: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    prisma = {
      campaignInvitation: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn((callback) => callback(transaction)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a new user and returns a token plus safe user profile', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(async (data) => ({
      id: 'user-1',
      name: 'Test User',
      email: data.email,
      passwordHash: data.passwordHash,
    }));

    const result = await service.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret123',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: expect.any(String),
    });
    expect(prisma.campaignInvitation.findMany).toHaveBeenCalledWith({
      where: { email: 'test@example.com', status: InvitationStatus.PENDING },
    });
    expect(result).toEqual({
      access_token: 'signed-token',
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
    });
    expect('passwordHash' in result.user).toBe(false);
  });

  it('rejects duplicate registration emails', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'secret123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('auto-accepts pending campaign invitations after registration', async () => {
    const invite = {
      id: 'invite-1',
      campaignId: 'campaign-1',
      expiresAt: new Date(Date.now() + 60_000),
    };
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hash',
    });
    prisma.campaignInvitation.findMany.mockResolvedValue([invite]);

    await service.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret123',
    });

    expect(transaction.campaignInvitation.update).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
      data: { status: InvitationStatus.ACCEPTED, acceptedAt: expect.any(Date) },
    });
    expect(transaction.campaignMember.create).toHaveBeenCalledWith({
      data: {
        campaignId: 'campaign-1',
        userId: 'user-1',
        role: CampaignRole.MEMBER,
        status: CampaignMemberStatus.ACTIVE,
      },
    });
  });

  it('validates a login password', async () => {
    const passwordHash = await bcrypt.hash('secret123', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
    });

    const result = await service.validateUser('test@example.com', 'secret123');

    expect(result).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  it('rejects an invalid login password', async () => {
    const passwordHash = await bcrypt.hash('secret123', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
    });

    await expect(service.validateUser('test@example.com', 'wrong-password')).resolves.toBeNull();
  });

  it('returns the current user profile without the password hash', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hash',
    });

    await expect(service.profile('user-1')).resolves.toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  it('rejects a profile request for a missing user', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(service.profile('missing-user')).rejects.toThrow(UnauthorizedException);
  });
});
