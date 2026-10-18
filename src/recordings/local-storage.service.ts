import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { mkdir, rm, writeFile } from 'fs/promises';
import { dirname, join, resolve, sep } from 'path';

const KEY_PATTERN = /^recordings\/[\w-]+\/[\w-]+\.webm$/;
const PLAYBACK_TTL_SECONDS = 3600;

/**
 * Drop-in replacement for S3Service that keeps audio on local disk. Playback
 * URLs are HMAC-signed so an <audio> tag can fetch them without a JWT header.
 */
@Injectable()
export class LocalStorageService {
  private readonly root: string;
  private readonly secret: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.root = resolve(
      this.config.get<string>(
        'STORAGE_LOCAL_DIR',
        join(process.cwd(), 'storage'),
      ),
    );
    this.secret = this.config.get<string>('JWT_SECRET', 'dev-secret-change-me');
    this.publicUrl = this.config.get<string>('API_PUBLIC_URL', '');
  }

  async uploadAudio(
    userId: string,
    buffer: Buffer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mimetype: string,
  ): Promise<string> {
    const key = `recordings/${userId}/${randomUUID()}.webm`;
    const path = this.pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, buffer);
    return key;
  }

  getPlaybackUrl(key: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + PLAYBACK_TTL_SECONDS;
    const params = new URLSearchParams({
      key,
      exp: String(exp),
      sig: this.sign(key, exp),
    });
    return Promise.resolve(`${this.publicUrl}/api/recordings/audio?${params}`);
  }

  async deleteAudio(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true });
  }

  /** Returns the absolute file path if the signature is valid and unexpired, else null. */
  resolveSigned(key: string, exp: number, sig: string): string | null {
    if (!Number.isFinite(exp) || exp < Date.now() / 1000) return null;
    const expected = Buffer.from(this.sign(key, exp));
    const actual = Buffer.from(sig ?? '');
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      return null;
    }
    return this.pathFor(key);
  }

  private sign(key: string, exp: number): string {
    return createHmac('sha256', this.secret)
      .update(`${key}.${exp}`)
      .digest('hex');
  }

  private pathFor(key: string): string {
    const path = resolve(this.root, key);
    if (!KEY_PATTERN.test(key) || !path.startsWith(this.root + sep)) {
      throw new Error(`Invalid storage key: ${key}`);
    }
    return path;
  }
}
