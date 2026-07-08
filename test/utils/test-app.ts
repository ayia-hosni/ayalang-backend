import './setup-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { S3Service } from '../../src/recordings/s3.service';
import { createMockS3Service, MockS3Service } from './mock-s3.service';

export interface TestApp {
  app: INestApplication;
  mockS3: MockS3Service;
}

export async function createTestApp(): Promise<TestApp> {
  const mockS3 = createMockS3Service();

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(S3Service)
    .useValue(mockS3)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.init();

  return { app, mockS3 };
}
