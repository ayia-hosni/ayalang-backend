import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import {
  createMockRepository,
  MockRepository,
} from '../common/testing/mock-repository';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: MockRepository<Category>;

  beforeEach(async () => {
    repository = createMockRepository<Category>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: repository },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('returns all categories', async () => {
    const categories = [{ id: '1', title: 'Behavioral' }] as Category[];
    repository.find!.mockResolvedValue(categories);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith();
    expect(result).toBe(categories);
  });
});
