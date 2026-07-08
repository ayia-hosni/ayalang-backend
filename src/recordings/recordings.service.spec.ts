import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { Recording } from './recording.entity';
import { S3Service } from './s3.service';
import { UsersService } from '../users/users.service';
import {
  createMockRepository,
  MockRepository,
} from '../common/testing/mock-repository';

describe('RecordingsService', () => {
  let service: RecordingsService;
  let repository: MockRepository<Recording>;
  let s3Service: {
    uploadAudio: jest.Mock;
    getPlaybackUrl: jest.Mock;
    deleteAudio: jest.Mock;
  };
  let usersService: { addXP: jest.Mock };

  beforeEach(async () => {
    repository = createMockRepository<Recording>();
    s3Service = {
      uploadAudio: jest.fn(),
      getPlaybackUrl: jest.fn(),
      deleteAudio: jest.fn(),
    };
    usersService = { addXP: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordingsService,
        { provide: getRepositoryToken(Recording), useValue: repository },
        { provide: S3Service, useValue: s3Service },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<RecordingsService>(RecordingsService);
  });

  describe('findForQuestion', () => {
    it('returns playback metadata for each recording', async () => {
      const recordings = [
        {
          id: 'rec-1',
          duration: 42,
          createdAt: new Date('2026-01-01'),
          s3Key: 'recordings/user-1/a.webm',
          subQuestion: { id: 'sub-1' },
        },
      ] as unknown as Recording[];
      repository.find!.mockResolvedValue(recordings);
      s3Service.getPlaybackUrl.mockResolvedValue('https://signed-url');

      const result = await service.findForQuestion('user-1', 'question-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' }, question: { id: 'question-1' } },
        relations: ['subQuestion'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([
        {
          id: 'rec-1',
          duration: 42,
          createdAt: new Date('2026-01-01'),
          subQuestionId: 'sub-1',
          playbackUrl: 'https://signed-url',
        },
      ]);
    });

    it('defaults subQuestionId to null when there is no sub-question', async () => {
      repository.find!.mockResolvedValue([
        {
          id: 'rec-1',
          duration: 10,
          createdAt: new Date(),
          s3Key: 'key',
          subQuestion: null,
        },
      ] as unknown);
      s3Service.getPlaybackUrl.mockResolvedValue('https://signed-url');

      const [result] = await service.findForQuestion('user-1', 'question-1');

      expect(result.subQuestionId).toBeNull();
    });
  });

  describe('create', () => {
    it('uploads audio, persists the recording, and awards XP', async () => {
      const file = {
        buffer: Buffer.from('audio'),
        mimetype: 'audio/webm',
      } as Express.Multer.File;
      s3Service.uploadAudio.mockResolvedValue('recordings/user-1/new.webm');
      const created = { s3Key: 'recordings/user-1/new.webm' };
      repository.create!.mockReturnValue(created);
      const saved = {
        id: 'rec-2',
        duration: 30,
        createdAt: new Date('2026-02-01'),
        s3Key: 'recordings/user-1/new.webm',
      };
      repository.save!.mockResolvedValue(saved);
      usersService.addXP.mockResolvedValue({ totalXP: 125 });
      s3Service.getPlaybackUrl.mockResolvedValue('https://signed-url');

      const result = await service.create(
        'user-1',
        'question-1',
        'sub-1',
        30,
        file,
      );

      expect(s3Service.uploadAudio).toHaveBeenCalledWith(
        'user-1',
        file.buffer,
        file.mimetype,
      );
      expect(repository.create).toHaveBeenCalledWith({
        user: { id: 'user-1' },
        question: { id: 'question-1' },
        subQuestion: { id: 'sub-1' },
        s3Key: 'recordings/user-1/new.webm',
        duration: 30,
      });
      expect(usersService.addXP).toHaveBeenCalledWith('user-1', 25);
      expect(result).toEqual({
        id: 'rec-2',
        duration: 30,
        createdAt: saved.createdAt,
        subQuestionId: 'sub-1',
        playbackUrl: 'https://signed-url',
        totalXP: 125,
      });
    });

    it('stores a null sub-question when none is provided', async () => {
      const file = {
        buffer: Buffer.from('audio'),
        mimetype: 'audio/webm',
      } as Express.Multer.File;
      s3Service.uploadAudio.mockResolvedValue('key');
      repository.create!.mockReturnValue({});
      repository.save!.mockResolvedValue({
        id: 'rec-3',
        duration: 10,
        createdAt: new Date(),
        s3Key: 'key',
      });
      usersService.addXP.mockResolvedValue({ totalXP: 25 });
      s3Service.getPlaybackUrl.mockResolvedValue('https://signed-url');

      await service.create('user-1', 'question-1', null, 10, file);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ subQuestion: null }),
      );
    });
  });

  describe('countForUser', () => {
    it('returns the total recording count for a user', async () => {
      repository.count!.mockResolvedValue(7);

      const result = await service.countForUser('user-1');

      expect(repository.count).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
      });
      expect(result).toEqual({ totalCount: 7 });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the recording does not exist', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.remove('user-1', 'rec-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when the recording belongs to another user', async () => {
      repository.findOne!.mockResolvedValue({
        id: 'rec-1',
        s3Key: 'key',
        user: { id: 'other-user' },
      });

      await expect(service.remove('user-1', 'rec-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(s3Service.deleteAudio).not.toHaveBeenCalled();
    });

    it('deletes the audio file and removes the recording for its owner', async () => {
      const recording = {
        id: 'rec-1',
        s3Key: 'recordings/user-1/a.webm',
        user: { id: 'user-1' },
      };
      repository.findOne!.mockResolvedValue(recording);

      await service.remove('user-1', 'rec-1');

      expect(s3Service.deleteAudio).toHaveBeenCalledWith(
        'recordings/user-1/a.webm',
      );
      expect(repository.remove).toHaveBeenCalledWith(recording);
    });
  });
});
