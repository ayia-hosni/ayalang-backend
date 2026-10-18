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

    it('filters by track when provided', async () => {
      repository.find!.mockResolvedValue([]);

      await service.findAll('cat-1', 'Frontend');

      expect(repository.find).toHaveBeenCalledWith({
        where: { category: { id: 'cat-1' }, track: 'Frontend' },
        relations: ['category'],
        order: { subQuestions: { orderIndex: 'ASC' } },
      });
    });

    it('filters by difficulty when provided', async () => {
      repository.find!.mockResolvedValue([]);

      await service.findAll('cat-1', 'Frontend', 'Junior');

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          category: { id: 'cat-1' },
          track: 'Frontend',
          difficulty: 'Junior',
        },
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

  describe('getExampleAnswer', () => {
    it('returns a random stored example answer', async () => {
      const question = {
        id: '1',
        text: 'Tell me about yourself',
        exampleAnswers: ['I am a great fit because...'],
      } as Question;
      repository.findOne!.mockResolvedValue(question);

      const result = await service.getExampleAnswer('1');

      expect(result).toEqual({
        text: 'I am a great fit because...',
        source: 'stored',
      });
    });

    it('excludes the given answer when other options exist', async () => {
      const question = {
        id: '1',
        text: 'Tell me about yourself',
        exampleAnswers: ['Answer A', 'Answer B'],
      } as Question;
      repository.findOne!.mockResolvedValue(question);

      const result = await service.getExampleAnswer('1', 'Answer A');

      expect(result).toEqual({ text: 'Answer B', source: 'stored' });
    });

    it('falls back to the excluded answer when it is the only one stored', async () => {
      const question = {
        id: '1',
        text: 'Tell me about yourself',
        exampleAnswers: ['Only answer'],
      } as Question;
      repository.findOne!.mockResolvedValue(question);

      const result = await service.getExampleAnswer('1', 'Only answer');

      expect(result).toEqual({ text: 'Only answer', source: 'stored' });
    });

    it('throws NotFoundException when no example answers are stored', async () => {
      const question = {
        id: '1',
        text: 'Tell me about yourself',
        exampleAnswers: [],
      } as unknown as Question;
      repository.findOne!.mockResolvedValue(question);

      await expect(service.getExampleAnswer('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
