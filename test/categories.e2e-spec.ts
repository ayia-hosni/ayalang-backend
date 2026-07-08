import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/test-app';
import { clearDatabase } from './utils/clear-database';
import { Category } from '../src/categories/category.entity';

describe('Categories (e2e)', () => {
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

  it('returns an empty list when there are no categories', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/categories')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('lists all categories', async () => {
    const repo = dataSource.getRepository(Category);
    await repo.save(
      repo.create({
        title: 'Behavioral',
        subtitle: 'Soft skills',
        color: '#123456',
        icon: 'chat',
      }),
    );

    const response = await request(app.getHttpServer())
      .get('/api/categories')
      .expect(200);

    const body = response.body as Category[];
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      title: 'Behavioral',
      subtitle: 'Soft skills',
    });
  });
});
