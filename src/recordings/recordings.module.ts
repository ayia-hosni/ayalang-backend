import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './recording.entity';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { S3Service } from './s3.service';
import { LocalStorageService } from './local-storage.service';
import { RecordingAudioController } from './recording-audio.controller';
import { TranscriptionService } from './transcription.service';
import { GrammarService } from './grammar.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recording]), UsersModule],
  providers: [
    RecordingsService,
    LocalStorageService,
    // RecordingsService depends on the S3Service interface; STORAGE_DRIVER
    // picks the implementation behind it (default: local disk).
    {
      provide: S3Service,
      inject: [ConfigService, LocalStorageService],
      useFactory: (config: ConfigService, local: LocalStorageService) =>
        config.get<string>('STORAGE_DRIVER', 'local') === 's3'
          ? new S3Service(config)
          : local,
    },
    TranscriptionService,
    GrammarService,
  ],
  controllers: [RecordingsController, RecordingAudioController],
})
export class RecordingsModule {}
