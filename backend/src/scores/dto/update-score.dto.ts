import { IsInt, Min } from 'class-validator';

export class UpdateScoreDto {
  @IsInt()
  @Min(1)
  totalStrokes!: number;
}