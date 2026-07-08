import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/test-app';
import { clearDatabase } from './utils/clear-database';
import { MockS3Service } from './utils/mock-s3.service';
import { AuthResponseBody, RecordingResponseBody } from './utils/types';
import { Category } from '../src/categories/category.entity';
import { Question } from '../src/questions/question.entity';

describe('Recordings (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let mockS3: MockS3Service;

  beforeEach(async () => {
    ({ app, mockS3 } = await createTestApp());
    dataSource = app.get(DataSource);
    await clearDatabase(dataSource);
  });

  afterEach(async () => {
    await app.close();
  });

  async function registerUser(
    email: string,
  ): Promise<{ accessToken: string; userId: string }> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);
    const body = response.body as AuthResponseBody;
    return { accessToken: body.accessToken, userId: body.user.id };
  }

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
        hints: [],
        category,
        subQuestions: [{ text: 'Background', orderIndex: 0 }],
      }),
    );
  }

  it('rejects unauthenticated requests', async () => {
    await request(app.getHttpServer()).get('/api/recordings/stats').expect(401);
  });

  it('creates a recording, awards XP, lists it, and reports stats', async () => {
    const { accessToken } = await registerUser('jane@example.com');
    const question = await seedQuestion();

    const createResponse = await request(app.getHttpServer())
      .post('/api/recordings')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('questionId', question.id)
      .field('subQuestionId', question.subQuestions[0].id)
      .field('duration', '15')
      .attach('audio', Buffer.from('fake-audio-bytes'), 'answer.webm')
      .expect(201);

    const createBody = createResponse.body as RecordingResponseBody;
    expect(createBody).toMatchObject({
      duration: 15,
      subQuestionId: question.subQuestions[0].id,
      playbackUrl: 'https://mock-s3.test/playback-url',
      totalXP: 25,
    });
    expect(mockS3.uploadAudio).toHaveBeenCalledTimes(1);

    const listResponse = await request(app.getHttpServer())
      .get('/api/recordings')
      .query({ questionId: question.id })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(listResponse.body as RecordingResponseBody[]).toHaveLength(1);

    const statsResponse = await request(app.getHttpServer())
      .get('/api/recordings/stats')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(statsResponse.body).toEqual({ totalCount: 1 });
  });

  it("prevents deleting another user's recording", async () => {
    const owner = await registerUser('owner@example.com');
    const intruder = await registerUser('intruder@example.com');
    const question = await seedQuestion();

    const createResponse = await request(app.getHttpServer())
      .post('/api/recordings')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .field('questionId', question.id)
      .field('duration', '5')
      .attach('audio', Buffer.from('fake-audio-bytes'), 'answer.webm')
      .expect(201);
    const { id: recordingId } = createResponse.body as RecordingResponseBody;

    await request(app.getHttpServer())
      .delete(`/api/recordings/${recordingId}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/api/recordings/${recordingId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);

    expect(mockS3.deleteAudio).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when deleting a recording that no longer exists', async () => {
    const { accessToken } = await registerUser('jane@example.com');

    await request(app.getHttpServer())
      .delete('/api/recordings/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
