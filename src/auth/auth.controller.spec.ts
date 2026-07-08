import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates registration to AuthService', async () => {
    const expected = { accessToken: 'token', user: { id: '1' } };
    authService.register.mockResolvedValue(expected);

    const result = await controller.register({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(authService.register).toHaveBeenCalledWith(
      'jane@example.com',
      'password123',
    );
    expect(result).toBe(expected);
  });

  it('delegates login to AuthService', async () => {
    const expected = { accessToken: 'token', user: { id: '1' } };
    authService.login.mockResolvedValue(expected);

    const result = await controller.login({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(authService.login).toHaveBeenCalledWith(
      'jane@example.com',
      'password123',
    );
    expect(result).toBe(expected);
  });
});
