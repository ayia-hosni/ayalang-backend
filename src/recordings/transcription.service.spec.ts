import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TranscriptionService } from './transcription.service';

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  const config = {
    get: jest.fn((_key: string, fallback: string) => fallback),
  };
  const fetchMock = jest.fn();

  beforeEach(async () => {
    fetchMock.mockReset();
    global.fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptionService,
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<TranscriptionService>(TranscriptionService);
  });

  it('returns the trimmed transcript on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '  hello world  ' }),
    });

    const result = await service.transcribe(Buffer.from('audio'), 'audio/webm');

    expect(result).toBe('hello world');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/asr?output=json&task=transcribe'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns null when the ASR service errors', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const result = await service.transcribe(Buffer.from('audio'), 'audio/webm');

    expect(result).toBeNull();
  });

  it('returns null when the request throws', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const result = await service.transcribe(Buffer.from('audio'), 'audio/webm');

    expect(result).toBeNull();
  });
});
