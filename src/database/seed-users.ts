import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User } from '../users/user.entity';

const SALT_ROUNDS = 10;

const SEED_USERS: { email: string; password: string; displayName: string }[] = [
  {
    email: 'alex@example.com',
    password: 'password123',
    displayName: 'Alex Candidate',
  },
  {
    email: 'sam@example.com',
    password: 'password123',
    displayName: 'Sam Candidate',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepo = app.get<Repository<User>>(getRepositoryToken(User));

  for (const seedUser of SEED_USERS) {
    const existing = await usersRepo.findOne({
      where: { email: seedUser.email },
    });
    if (existing) {
      console.log(`Skipped ${seedUser.email}: already exists.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(seedUser.password, SALT_ROUNDS);
    const user = usersRepo.create({
      email: seedUser.email,
      passwordHash,
      displayName: seedUser.displayName,
    });
    await usersRepo.save(user);
    console.log(`Created ${seedUser.email}`);
  }

  console.log('User seed complete.');
  await app.close();
}

seed().catch((err) => {
  console.error('User seed failed', err);
  process.exit(1);
});
