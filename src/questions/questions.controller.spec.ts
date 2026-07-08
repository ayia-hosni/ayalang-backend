import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question } from './question.entity';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let questionsService: { findAll: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    questionsService = { findAll: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [{ provide: QuestionsService, useValue: questionsService }],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
  });

  it('passes the categoryId query param through to the service', async () => {
    const questions = [{ id: '1' }] as Question[];
    questionsService.findAll.mockResolvedValue(questions);

    const result = await controller.findAll('cat-1');

    expect(questionsService.findAll).toHaveBeenCalledWith('cat-1');
    expect(result).toBe(questions);
  });

  it('delegates single question lookups to the service', async () => {
    const question = { id: '1' } as Question;
    questionsService.findOne.mockResolvedValue(question);

    const result = await controller.findOne('1');

    expect(questionsService.findOne).toHaveBeenCalledWith('1');
    expect(result).toBe(question);
  });
});
