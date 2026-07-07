import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Category } from '../categories/category.entity';
import { Question } from '../questions/question.entity';
import { SubQuestion } from '../questions/sub-question.entity';

const SEED_DATA: {
  category: Omit<Category, 'id' | 'questions'>;
  questions: {
    text: string;
    subQuestions: string[];
    hints: string[];
  }[];
}[] = [
  {
    category: {
      title: 'Behavioral',
      subtitle: 'Common Scenarios',
      color: 'bg-pink-400',
      icon: '🧠',
    },
    questions: [
      {
        text: 'Tell me about a time you led a team through a conflict.',
        subQuestions: [
          'What was the conflict, specifically?',
          'What was your role in resolving it?',
          'What was the outcome, and what would you do differently?',
        ],
        hints: [
          'Use the STAR method: Situation, Task, Action, Result.',
          'Focus on your actions, not just what the team did.',
          'End with a concrete, measurable outcome.',
        ],
      },
      {
        text: 'Describe a time you failed and what you learned from it.',
        subQuestions: [
          'What was the situation and what went wrong?',
          'What did you learn from it?',
          'How have you applied that lesson since?',
        ],
        hints: [
          "Pick a real failure — avoid disguised humble-brags like 'I worked too hard'.",
          'Own the mistake before explaining the lesson.',
          'Show growth: connect the lesson to a later, better outcome.',
        ],
      },
    ],
  },
  {
    category: {
      title: 'Technical',
      subtitle: 'Skill Checks',
      color: 'bg-yellow-400',
      icon: '💻',
    },
    questions: [
      {
        text: 'How would you design a URL shortening service?',
        subQuestions: [
          'What are the functional and non-functional requirements?',
          'How do you generate and store short codes?',
          'How does the system scale for reads vs. writes?',
        ],
        hints: [
          'Clarify requirements first: scale, custom aliases, expiry.',
          'Talk about the encoding scheme (base62) and collision handling.',
          'Mention caching and read/write ratio to justify your data store choice.',
        ],
      },
      {
        text: 'Explain how you would debug a memory leak in a production service.',
        subQuestions: [
          'How do you confirm it is actually a leak?',
          'What tools would you use to find the source?',
          'How do you validate the fix in production?',
        ],
        hints: [
          'Start with monitoring/metrics before diving into a heap dump.',
          'Name concrete tools (heap snapshots, profilers) relevant to your stack.',
          'Mention a safe rollout: canary, gradual traffic, and rollback plan.',
        ],
      },
    ],
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoriesRepo = app.get<Repository<Category>>(
    getRepositoryToken(Category),
  );
  const questionsRepo = app.get<Repository<Question>>(
    getRepositoryToken(Question),
  );

  const existing = await categoriesRepo.count();
  if (existing > 0) {
    console.log('Seed skipped: categories already exist.');
    await app.close();
    return;
  }

  for (const group of SEED_DATA) {
    const category = await categoriesRepo.save(
      categoriesRepo.create(group.category),
    );
    for (const q of group.questions) {
      const question = questionsRepo.create({
        text: q.text,
        hints: q.hints,
        category,
        subQuestions: q.subQuestions.map(
          (text, index): Partial<SubQuestion> => ({ text, orderIndex: index }),
        ),
      });
      await questionsRepo.save(question);
    }
  }

  console.log('Seed complete.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
