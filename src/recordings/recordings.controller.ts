import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { RecordingsService } from './recordings.service';

@Controller('recordings')
@UseGuards(AuthGuard('jwt'))
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Get()
  findForQuestion(
    @Req() req: Request,
    @Query('questionId') questionId: string,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.recordingsService.findForQuestion(userId, questionId);
  }

  @Get('stats')
  stats(@Req() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.recordingsService.countForUser(userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  create(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('questionId') questionId: string,
    @Body('subQuestionId') subQuestionId: string | undefined,
    @Body('duration') duration: string,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.recordingsService.create(
      userId,
      questionId,
      subQuestionId || null,
      Number(duration) || 0,
      file,
    );
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.recordingsService.remove(userId, id);
  }
}
