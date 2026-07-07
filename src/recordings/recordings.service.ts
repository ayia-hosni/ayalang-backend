import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording } from './recording.entity';
import { S3Service } from './s3.service';
import { UsersService } from '../users/users.service';

const XP_PER_RECORDING = 25;

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private readonly recordingsRepository: Repository<Recording>,
    private readonly s3Service: S3Service,
    private readonly usersService: UsersService,
  ) {}

  async findForQuestion(userId: string, questionId: string) {
    const recordings = await this.recordingsRepository.find({
      where: { user: { id: userId }, question: { id: questionId } },
      relations: ['subQuestion'],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(
      recordings.map(async (recording) => ({
        id: recording.id,
        duration: recording.duration,
        createdAt: recording.createdAt,
        subQuestionId: recording.subQuestion?.id ?? null,
        playbackUrl: await this.s3Service.getPlaybackUrl(recording.s3Key),
      })),
    );
  }

  async create(
    userId: string,
    questionId: string,
    subQuestionId: string | null,
    duration: number,
    file: Express.Multer.File,
  ) {
    const s3Key = await this.s3Service.uploadAudio(
      userId,
      file.buffer,
      file.mimetype,
    );
    const recording = this.recordingsRepository.create({
      user: { id: userId },
      question: { id: questionId },
      subQuestion: subQuestionId ? { id: subQuestionId } : null,
      s3Key,
      duration,
    });
    const saved = await this.recordingsRepository.save(recording);
    const user = await this.usersService.addXP(userId, XP_PER_RECORDING);
    return {
      id: saved.id,
      duration: saved.duration,
      createdAt: saved.createdAt,
      subQuestionId,
      playbackUrl: await this.s3Service.getPlaybackUrl(saved.s3Key),
      totalXP: user.totalXP,
    };
  }

  async countForUser(userId: string): Promise<{ totalCount: number }> {
    const totalCount = await this.recordingsRepository.count({
      where: { user: { id: userId } },
    });
    return { totalCount };
  }

  async remove(userId: string, recordingId: string): Promise<void> {
    const recording = await this.recordingsRepository.findOne({
      where: { id: recordingId },
      relations: ['user'],
    });
    if (!recording) throw new NotFoundException('Recording not found');
    if (recording.user.id !== userId) throw new ForbiddenException();
    await this.s3Service.deleteAudio(recording.s3Key);
    await this.recordingsRepository.remove(recording);
  }
}
