import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Service } from './s3.service';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: sendMock })),
  PutObjectCommand: jest
    .fn()
    .mockImplementation((input: unknown) => ({ input })),
  GetObjectCommand: jest
    .fn()
    .mockImplementation((input: unknown) => ({ input })),
  DeleteObjectCommand: jest
    .fn()
    .mockImplementation((input: unknown) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;
  const config = {
    get: jest.fn((key: string, fallback: string) => fallback),
  };

  beforeEach(async () => {
    sendMock.mockReset();
    (getSignedUrl as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, { provide: ConfigService, useValue: config }],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('uploads audio under a per-user key and returns it', async () => {
    sendMock.mockResolvedValue({});

    const key = await service.uploadAudio(
      'user-1',
      Buffer.from('audio'),
      'audio/webm',
    );

    expect(key).toMatch(/^recordings\/user-1\/.+\.webm$/);
    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'aya-interviewer-audio-dev',
        Key: key,
        ContentType: 'audio/webm',
      }),
    );
    expect(sendMock).toHaveBeenCalled();
  });

  it('returns a signed playback url for a given key', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://signed-url');

    const url = await service.getPlaybackUrl('recordings/user-1/a.webm');

    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: 'aya-interviewer-audio-dev',
      Key: 'recordings/user-1/a.webm',
    });
    expect(url).toBe('https://signed-url');
  });

  it('deletes the audio object for a given key', async () => {
    sendMock.mockResolvedValue({});

    await service.deleteAudio('recordings/user-1/a.webm');

    expect(DeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: 'aya-interviewer-audio-dev',
      Key: 'recordings/user-1/a.webm',
    });
    expect(sendMock).toHaveBeenCalled();
  });
});
