import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Question } from '../questions/question.entity';
import { SubQuestion } from '../questions/sub-question.entity';

@Entity('recordings')
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => SubQuestion, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'sub_question_id' })
  subQuestion: SubQuestion | null;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'text', nullable: true })
  transcript: string | null;

  @Column({ name: 'corrected_text', type: 'text', nullable: true })
  correctedText: string | null;

  @Column({ name: 'grammar_issues', type: 'jsonb', nullable: true })
  grammarIssues: GrammarIssue[] | null;

  @CreateDateColumn()
  createdAt: Date;
}

export interface GrammarIssue {
  message: string;
  offset: number;
  length: number;
  replacements: string[];
}
