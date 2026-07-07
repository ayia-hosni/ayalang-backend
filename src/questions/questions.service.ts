import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  findAll(categoryId?: string): Promise<Question[]> {
    return this.questionsRepository.find({
      where: categoryId ? { category: { id: categoryId } } : {},
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
}
