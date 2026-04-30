import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  roundId!: number;

  @Column()
  userId!: number;

  @Column({ default: 'accepted' })
  status!: string;
}