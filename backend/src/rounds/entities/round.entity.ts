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

  @Column({ nullable: true })
  courseAddress!: string;

  @Column({ type: 'double', nullable: true })
  courseLatitude!: number;

  @Column({ type: 'double', nullable: true })
  courseLongitude!: number;

  @Column({ nullable: true })
  placeId!: string;

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