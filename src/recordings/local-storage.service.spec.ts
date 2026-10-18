import { ConfigService } from '@nestjs/config';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let dir: string;
  let service: LocalStorageService;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'aya-audio-'));
    const values: Record<string, string> = {
      STORAGE_LOCAL_DIR: dir,
      JWT_SECRET: 'test-secret',
      API_PUBLIC_URL: 'https://api.test',
    };
    const config = {
      get: (key: string, fallback?: string) => values[key] ?? fallback,
    } as ConfigService;
    service = new LocalStorageService(config);
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const parse = (url: string) => {
    const params = new URL(url).searchParams;
    return [
      params.get('key')!,
      Number(params.get('exp')),
      params.get('sig')!,
    ] as const;
  };

  it('stores audio under a per-user key and resolves a signed URL to the file', async () => {
    const key = await service.uploadAudio(
      'user-1',
      Buffer.from('a'),
      'audio/webm',
    );
    expect(key).toMatch(/^recordings\/user-1\/.+\.webm$/);

    const url = await service.getPlaybackUrl(key);
    expect(url.startsWith('https://api.test/api/recordings/audio?')).toBe(true);
    const path = service.resolveSigned(...parse(url));
    expect(path).toBe(join(dir, key));
    expect(existsSync(path!)).toBe(true);
  });

  it('rejects a tampered signature or key', async () => {
    const key = await service.uploadAudio(
      'user-1',
      Buffer.from('a'),
      'audio/webm',
    );
    const [, exp, sig] = parse(await service.getPlaybackUrl(key));

    expect(service.resolveSigned(key, exp, 'bad')).toBeNull();
    expect(
      service.resolveSigned('recordings/user-2/x.webm', exp, sig),
    ).toBeNull();
  });

  it('rejects an expired URL', async () => {
    const key = await service.uploadAudio(
      'user-1',
      Buffer.from('a'),
      'audio/webm',
    );
    const [, , sig] = parse(await service.getPlaybackUrl(key));
    expect(service.resolveSigned(key, 1, sig)).toBeNull();
  });

  it('refuses path-traversal keys', async () => {
    await expect(service.deleteAudio('../../etc/passwd')).rejects.toThrow();
  });

  it('deletes the file', async () => {
    const key = await service.uploadAudio(
      'user-1',
      Buffer.from('a'),
      'audio/webm',
    );
    await service.deleteAudio(key);
    expect(existsSync(join(dir, key))).toBe(false);
  });
});
