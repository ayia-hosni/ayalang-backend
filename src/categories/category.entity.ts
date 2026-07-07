import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from '../questions/question.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column()
  color: string;

  @Column()
  icon: string;

  @OneToMany(() => Question, (question) => question.category)
  questions: Question[];
}
