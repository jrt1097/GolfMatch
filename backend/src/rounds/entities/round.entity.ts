import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Round {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  courseName!: string;

  @Column()
  scheduledAt!: string;

  @Column()
  format!: string;

  @Column({ default: 'open' })
  status!: string;

  @Column({ default: 'public' })
  visibility!: string;

  @Column()
  createdByUserId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}