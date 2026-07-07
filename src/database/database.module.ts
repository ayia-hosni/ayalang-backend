import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Question } from '../questions/question.entity';
import { SubQuestion } from '../questions/sub-question.entity';
import { Recording } from '../recordings/recording.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'aya_interviewer'),
        entities: [User, Category, Question, SubQuestion, Recording],
        // Demo-scale project: schema is kept in sync automatically outside
        // production. Real production use should switch to TypeORM migrations.
        synchronize:
          config.get<string>('NODE_ENV', 'development') !== 'production',
        ssl:
          config.get<string>('DB_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
