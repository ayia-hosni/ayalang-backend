import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';

describe('RecordingsController', () => {
  let controller: RecordingsController;
  let recordingsService: {
    findForQuestion: jest.Mock;
    countForUser: jest.Mock;
    create: jest.Mock;
    remove: jest.Mock;
  };

  const req = { user: { userId: 'user-1' } } as unknown as Request;

  beforeEach(async () => {
    recordingsService = {
      findForQuestion: jest.fn(),
      countForUser: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordingsController],
      providers: [{ provide: RecordingsService, useValue: recordingsService }],
    }).compile();

    controller = module.get<RecordingsController>(RecordingsController);
  });

  it('lists recordings scoped to the authenticated user and question', async () => {
    recordingsService.findForQuestion.mockResolvedValue([]);

    await controller.findForQuestion(req, 'question-1');

    expect(recordingsService.findForQuestion).toHaveBeenCalledWith(
      'user-1',
      'question-1',
    );
  });

  it('returns recording stats for the authenticated user', async () => {
    recordingsService.countForUser.mockResolvedValue({ totalCount: 3 });

    const result = await controller.stats(req);

    expect(recordingsService.countForUser).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ totalCount: 3 });
  });

  it('creates a recording with a parsed duration and optional sub-question', async () => {
    const file = { buffer: Buffer.from('x') } as Express.Multer.File;
    recordingsService.create.mockResolvedValue({ id: 'rec-1' });

    await controller.create(req, file, 'question-1', 'sub-1', '12');

    expect(recordingsService.create).toHaveBeenCalledWith(
      'user-1',
      'question-1',
      'sub-1',
      12,
      file,
    );
  });

  it('defaults subQuestionId to null and duration to 0 when omitted or invalid', async () => {
    const file = { buffer: Buffer.from('x') } as Express.Multer.File;
    recordingsService.create.mockResolvedValue({ id: 'rec-1' });

    await controller.create(req, file, 'question-1', undefined, 'not-a-number');

    expect(recordingsService.create).toHaveBeenCalledWith(
      'user-1',
      'question-1',
      null,
      0,
      file,
    );
  });

  it('removes a recording owned by the authenticated user', async () => {
    recordingsService.remove.mockResolvedValue(undefined);

    await controller.remove(req, 'rec-1');

    expect(recordingsService.remove).toHaveBeenCalledWith('user-1', 'rec-1');
  });
});
