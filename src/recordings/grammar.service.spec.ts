import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GrammarService } from './grammar.service';

describe('GrammarService', () => {
  let service: GrammarService;
  const config = {
    get: jest.fn((_key: string, fallback: string) => fallback),
  };
  const fetchMock = jest.fn();

  beforeEach(async () => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [GrammarService, { provide: ConfigService, useValue: config }],
    }).compile();

    service = module.get<GrammarService>(GrammarService);
  });

  it('returns null for blank text without calling the API', async () => {
    const result = await service.check('   ');

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('applies replacements and returns the issue list', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          matches: [
            {
              message: 'Use the correct verb form',
              offset: 2,
              length: 3,
              replacements: [{ value: 'have' }, { value: 'has' }],
            },
          ],
        }),
    });

    const result = await service.check('I has a bug');

    expect(result).toEqual({
      correctedText: 'I have a bug',
      issues: [
        {
          message: 'Use the correct verb form',
          offset: 2,
          length: 3,
          replacements: ['have', 'has'],
        },
      ],
    });
  });

  it('returns null when the API errors', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });

    const result = await service.check('some text');

    expect(result).toBeNull();
  });
});
