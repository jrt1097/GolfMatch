import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  roundId!: number;

  @Column()
  userId!: number;

  @Column()
  totalStrokes!: number;

  @CreateDateColumn()
  submittedAt!: Date;
}