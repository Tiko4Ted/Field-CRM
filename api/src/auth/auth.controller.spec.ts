import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    validateUser: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    profile: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      validateUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      profile: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('logs in with valid credentials', async () => {
    const user = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
    const response = { access_token: 'token', user };
    authService.validateUser.mockResolvedValue(user);
    authService.login.mockResolvedValue(response);

    await expect(controller.login({ email: 'test@example.com', password: 'secret123' })).resolves.toBe(response);
  });

  it('rejects invalid login credentials', async () => {
    authService.validateUser.mockResolvedValue(null);

    await expect(controller.login({ email: 'test@example.com', password: 'wrong-password' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('registers a new account', async () => {
    const response = {
      access_token: 'token',
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
    };
    authService.register.mockResolvedValue(response);

    await expect(
      controller.register({ name: 'Test User', email: 'test@example.com', password: 'secret123' }),
    ).resolves.toBe(response);
  });

  it('returns the current user profile', async () => {
    const profile = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
    authService.profile.mockResolvedValue(profile);

    await expect(controller.me({ user: { id: 'user-1', email: 'test@example.com' } })).resolves.toBe(profile);
  });
});
