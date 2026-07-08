import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/test-app';
import { clearDatabase } from './utils/clear-database';
import { Category } from '../src/categories/category.entity';
import { Question } from '../src/questions/question.entity';

describe('Questions (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    ({ app } = await createTestApp());
    dataSource = app.get(DataSource);
    await clearDatabase(dataSource);
  });

  afterEach(async () => {
    await app.close();
  });

  async function seedQuestion(): Promise<Question> {
    const categoryRepo = dataSource.getRepository(Category);
    const category = await categoryRepo.save(
      categoryRepo.create({
        title: 'Behavioral',
        subtitle: 'Soft skills',
        color: '#123456',
        icon: 'chat',
      }),
    );
    const questionRepo = dataSource.getRepository(Question);
    return questionRepo.save(
      questionRepo.create({
        text: 'Tell me about yourself',
        hints: ['Keep it concise'],
        category,
        subQuestions: [
          { text: 'What is your background?', orderIndex: 0 },
          { text: 'What are your strengths?', orderIndex: 1 },
        ],
      }),
    );
  }

  describe('GET /api/questions', () => {
    it('lists all questions with ordered sub-questions', async () => {
      await seedQuestion();

      const response = await request(app.getHttpServer())
        .get('/api/questions')
        .expect(200);

      const body = response.body as Question[];
      expect(body).toHaveLength(1);
      expect(
        body[0].subQuestions.map((subQuestion) => subQuestion.orderIndex),
      ).toEqual([0, 1]);
    });

    it('filters questions by categoryId', async () => {
      const question = await seedQuestion();

      const matching = await request(app.getHttpServer())
        .get('/api/questions')
        .query({ categoryId: question.category.id })
        .expect(200);
      expect(matching.body).toHaveLength(1);

      const nonMatching = await request(app.getHttpServer())
        .get('/api/questions')
        .query({ categoryId: '00000000-0000-0000-0000-000000000000' })
        .expect(200);
      expect(nonMatching.body).toEqual([]);
    });
  });

  describe('GET /api/questions/:id', () => {
    it('returns a single question by id', async () => {
      const question = await seedQuestion();

      const response = await request(app.getHttpServer())
        .get(`/api/questions/${question.id}`)
        .expect(200);

      const body = response.body as Question;
      expect(body.id).toBe(question.id);
      expect(body.text).toBe(question.text);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get('/api/questions/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
