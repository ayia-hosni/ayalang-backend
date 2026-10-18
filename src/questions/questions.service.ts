import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Question } from './question.entity';

export interface ExampleAnswerResult {
  text: string;
  source: 'stored';
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  findAll(
    categoryId?: string,
    track?: string,
    difficulty?: string,
  ): Promise<Question[]> {
    const where: FindOptionsWhere<Question> = {};
    if (categoryId) where.category = { id: categoryId };
    if (track) where.track = track;
    if (difficulty) where.difficulty = difficulty;

    return this.questionsRepository.find({
      where,
      relations: ['category'],
      order: { subQuestions: { orderIndex: 'ASC' } },
    });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async getExampleAnswer(
    id: string,
    exclude?: string,
  ): Promise<ExampleAnswerResult> {
    const question = await this.findOne(id);

    if (!question.exampleAnswers.length) {
      throw new NotFoundException(
        'No example answer is available for this question yet.',
      );
    }

    const candidates =
      exclude && question.exampleAnswers.length > 1
        ? question.exampleAnswers.filter((answer) => answer !== exclude)
        : question.exampleAnswers;

    const text = candidates[Math.floor(Math.random() * candidates.length)];
    return { text, source: 'stored' };
  }
}
