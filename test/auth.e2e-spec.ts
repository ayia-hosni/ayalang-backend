import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/test-app';
import { clearDatabase } from './utils/clear-database';
import { AuthResponseBody } from './utils/types';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const credentials = { email: 'jane@example.com', password: 'password123' };

  beforeEach(async () => {
    ({ app } = await createTestApp());
    dataSource = app.get(DataSource);
    await clearDatabase(dataSource);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('creates a new account and returns an access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(credentials)
        .expect(201);

      const body = response.body as AuthResponseBody;
      expect(typeof body.accessToken).toBe('string');
      expect(body.user).toMatchObject({
        email: credentials.email,
        displayName: 'Alex Candidate',
        totalXP: 0,
      });
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(credentials)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(credentials)
        .expect(409);
    });

    it('rejects an invalid payload with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(credentials)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      const body = response.body as AuthResponseBody;
      expect(body.accessToken).toEqual(expect.any(String));
    });

    it('rejects an unknown email with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'missing@example.com', password: 'password123' })
        .expect(401);
    });

    it('rejects an incorrect password with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(credentials)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: credentials.email, password: 'wrong-password' })
        .expect(401);
    });
  });
});
