import { Controller, Get, NotFoundException, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { LocalStorageService } from './local-storage.service';

// Separate from RecordingsController: <audio> tags can't send the JWT header,
// so access is authorised by the signed URL instead.
@Controller('recordings/audio')
export class RecordingAudioController {
  constructor(private readonly storage: LocalStorageService) {}

  @Get()
  stream(
    @Query('key') key: string,
    @Query('exp') exp: string,
    @Query('sig') sig: string,
    @Res() res: Response,
  ) {
    const path = this.storage.resolveSigned(key, Number(exp), sig);
    if (!path) throw new NotFoundException();
    res.type('audio/webm').sendFile(path, (err) => {
      if (err && !res.headersSent) res.status(404).end();
    });
  }
}
