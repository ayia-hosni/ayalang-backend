import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'TRANSCRIPTION_URL',
      'http://whisper:9000',
    );
  }

  async transcribe(buffer: Buffer, mimetype: string): Promise<string | null> {
    try {
      const form = new FormData();
      form.append(
        'audio_file',
        new Blob([new Uint8Array(buffer)], { type: mimetype }),
        'recording.webm',
      );

      const response = await fetch(
        `${this.baseUrl}/asr?output=json&task=transcribe`,
        { method: 'POST', body: form },
      );
      if (!response.ok) {
        throw new Error(`Whisper ASR returned ${response.status}`);
      }
      const data = (await response.json()) as { text?: string };
      return data.text?.trim() || null;
    } catch (err) {
      this.logger.warn(`Transcription failed: ${(err as Error).message}`);
      return null;
    }
  }
}
