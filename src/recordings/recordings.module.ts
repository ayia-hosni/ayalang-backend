import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './recording.entity';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { S3Service } from './s3.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recording]), UsersModule],
  providers: [RecordingsService, S3Service],
  controllers: [RecordingsController],
})
export class RecordingsModule {}
