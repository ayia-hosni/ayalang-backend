import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './question.entity';
import {
  createMockRepository,
  MockRepository,
} from '../common/testing/mock-repository';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let repository: MockRepository<Question>;

  beforeEach(async () => {
    repository = createMockRepository<Question>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: getRepositoryToken(Question), useValue: repository },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  describe('findAll', () => {
    it('queries without a category filter when none is given', async () => {
      const questions = [{ id: '1' }] as Question[];
      repository.find!.mockResolvedValue(questions);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['category'],
        order: { subQuestions: { orderIndex: 'ASC' } },
      });
      expect(result).toBe(questions);
    });

    it('filters by category id when provided', async () => {
      repository.find!.mockResolvedValue([]);

      await service.findAll('cat-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { category: { id: 'cat-1' } },
        relations: ['category'],
        order: { subQuestions: { orderIndex: 'ASC' } },
      });
    });
  });

  describe('findOne', () => {
    it('returns the question when found', async () => {
      const question = { id: '1' } as Question;
      repository.findOne!.mockResolvedValue(question);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['category'],
      });
      expect(result).toBe(question);
    });

    it('throws NotFoundException when the question does not exist', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
