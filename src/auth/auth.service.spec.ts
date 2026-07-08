import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    email: 'jane@example.com',
    passwordHash: 'hashed-password',
    displayName: 'Alex Candidate',
    totalXP: 0,
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates a new user and returns an access token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      const created = buildUser();
      usersService.create.mockResolvedValue(created);

      const result = await service.register('jane@example.com', 'password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        'jane@example.com',
        'hashed-password',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: created.id,
        email: created.email,
      });
      expect(result).toEqual({
        accessToken: 'signed-jwt-token',
        user: {
          id: created.id,
          email: created.email,
          displayName: created.displayName,
          totalXP: created.totalXP,
        },
      });
    });

    it('throws ConflictException when the email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register('jane@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      const existing = buildUser();
      usersService.findByEmail.mockResolvedValue(existing);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('jane@example.com', 'password123');

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user.email).toBe(existing.email);
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('missing@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('jane@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
