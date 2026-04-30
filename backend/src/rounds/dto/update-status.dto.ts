import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['open', 'in_progress', 'completed', 'cancelled'])
  status!: string;
}