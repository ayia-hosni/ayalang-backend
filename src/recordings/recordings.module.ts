import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './recording.entity';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { S3Service } from './s3.service';
import { TranscriptionService } from './transcription.service';
import { GrammarService } from './grammar.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recording]), UsersModule],
  providers: [
    RecordingsService,
    S3Service,
    TranscriptionService,
    GrammarService,
  ],
  controllers: [RecordingsController],
})
export class RecordingsModule {}
