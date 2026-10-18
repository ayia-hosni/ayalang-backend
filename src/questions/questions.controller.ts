import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('track') track?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.questionsService.findAll(categoryId, track, difficulty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Get(':id/example-answer')
  getExampleAnswer(
    @Param('id') id: string,
    @Query('exclude') exclude?: string,
  ) {
    return this.questionsService.getExampleAnswer(id, exclude);
  }
}
