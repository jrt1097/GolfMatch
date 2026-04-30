import { IsInt, Min } from 'class-validator';

export class CreateScoreDto {
  @IsInt()
  @Min(1)
  totalStrokes!: number;
}