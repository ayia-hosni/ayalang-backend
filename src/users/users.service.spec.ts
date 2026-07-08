import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import {
  createMockRepository,
  MockRepository,
} from '../common/testing/mock-repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  beforeEach(async () => {
    repository = createMockRepository<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('finds a user by email', async () => {
    const user = { id: '1', email: 'jane@example.com' } as User;
    repository.findOne!.mockResolvedValue(user);

    const result = await service.findByEmail('jane@example.com');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: 'jane@example.com' },
    });
    expect(result).toBe(user);
  });

  it('finds a user by id', async () => {
    const user = { id: '1', email: 'jane@example.com' } as User;
    repository.findOne!.mockResolvedValue(user);

    const result = await service.findById('1');

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toBe(user);
  });

  it('creates a user with the given email and password hash', async () => {
    const created = { email: 'jane@example.com', passwordHash: 'hash' };
    const saved = { id: '1', ...created } as User;
    repository.create!.mockReturnValue(created);
    repository.save!.mockResolvedValue(saved);

    const result = await service.create('jane@example.com', 'hash');

    expect(repository.create).toHaveBeenCalledWith({
      email: 'jane@example.com',
      passwordHash: 'hash',
    });
    expect(repository.save).toHaveBeenCalledWith(created);
    expect(result).toBe(saved);
  });

  it('increments XP and returns the refreshed user', async () => {
    const refreshed = { id: '1', totalXP: 125 } as User;
    repository.increment!.mockResolvedValue({ affected: 1 });
    repository.findOne!.mockResolvedValue(refreshed);

    const result = await service.addXP('1', 25);

    expect(repository.increment).toHaveBeenCalledWith(
      { id: '1' },
      'totalXP',
      25,
    );
    expect(result).toBe(refreshed);
  });
});
