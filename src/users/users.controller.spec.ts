import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { findById: jest.Mock };

  beforeEach(async () => {
    usersService = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('returns the profile for the authenticated user', async () => {
    const user = {
      id: 'user-1',
      email: 'jane@example.com',
      displayName: 'Alex Candidate',
      totalXP: 50,
    } as User;
    usersService.findById.mockResolvedValue(user);
    const req = { user: { userId: 'user-1' } } as unknown as Request;

    const result = await controller.me(req);

    expect(usersService.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      id: 'user-1',
      email: 'jane@example.com',
      displayName: 'Alex Candidate',
      totalXP: 50,
    });
  });
});
