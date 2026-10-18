import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { SubQuestion } from './sub-question.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column('text', { array: true, default: '{}' })
  hints: string[];

  @Column('text', { array: true, default: '{}' })
  exampleAnswers: string[];

  @Column({ type: 'text', nullable: true })
  track: string | null;

  @Column({ type: 'text', nullable: true })
  stack: string | null;

  @Column({ type: 'text', nullable: true })
  difficulty: string | null;

  @ManyToOne(() => Category, (category) => category.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => SubQuestion, (subQuestion) => subQuestion.question, {
    cascade: true,
    eager: true,
  })
  subQuestions: SubQuestion[];
}
