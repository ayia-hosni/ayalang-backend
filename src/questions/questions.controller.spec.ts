import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question } from './question.entity';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let questionsService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    getExampleAnswer: jest.Mock;
  };

  beforeEach(async () => {
    questionsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      getExampleAnswer: jest.fn(),
    };

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

    expect(questionsService.findAll).toHaveBeenCalledWith(
      'cat-1',
      undefined,
      undefined,
    );
    expect(result).toBe(questions);
  });

  it('passes the track query param through to the service', async () => {
    const questions = [{ id: '1' }] as Question[];
    questionsService.findAll.mockResolvedValue(questions);

    const result = await controller.findAll('cat-1', 'Frontend');

    expect(questionsService.findAll).toHaveBeenCalledWith(
      'cat-1',
      'Frontend',
      undefined,
    );
    expect(result).toBe(questions);
  });

  it('passes the difficulty query param through to the service', async () => {
    const questions = [{ id: '1' }] as Question[];
    questionsService.findAll.mockResolvedValue(questions);

    const result = await controller.findAll('cat-1', 'Frontend', 'Junior');

    expect(questionsService.findAll).toHaveBeenCalledWith(
      'cat-1',
      'Frontend',
      'Junior',
    );
    expect(result).toBe(questions);
  });

  it('delegates single question lookups to the service', async () => {
    const question = { id: '1' } as Question;
    questionsService.findOne.mockResolvedValue(question);

    const result = await controller.findOne('1');

    expect(questionsService.findOne).toHaveBeenCalledWith('1');
    expect(result).toBe(question);
  });

  it('passes undefined exclude through to the service when not provided', async () => {
    questionsService.getExampleAnswer.mockResolvedValue({
      text: 'An example',
      source: 'stored',
    });

    const result = await controller.getExampleAnswer('1', undefined);

    expect(questionsService.getExampleAnswer).toHaveBeenCalledWith(
      '1',
      undefined,
    );
    expect(result).toEqual({ text: 'An example', source: 'stored' });
  });

  it('passes the exclude query param through to the service', async () => {
    questionsService.getExampleAnswer.mockResolvedValue({
      text: 'Another example',
      source: 'stored',
    });

    await controller.getExampleAnswer('1', 'An example');

    expect(questionsService.getExampleAnswer).toHaveBeenCalledWith(
      '1',
      'An example',
    );
  });
});
