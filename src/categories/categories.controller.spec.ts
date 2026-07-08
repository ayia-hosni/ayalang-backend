import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: { findAll: jest.Mock };

  beforeEach(async () => {
    categoriesService = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: categoriesService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('delegates to CategoriesService.findAll', async () => {
    const categories = [{ id: '1', title: 'Behavioral' }] as Category[];
    categoriesService.findAll.mockResolvedValue(categories);

    const result = await controller.findAll();

    expect(categoriesService.findAll).toHaveBeenCalled();
    expect(result).toBe(categories);
  });
});
