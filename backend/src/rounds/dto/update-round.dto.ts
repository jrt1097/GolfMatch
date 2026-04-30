import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class UpdateRoundDto {
  @IsOptional()
  courseName?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsIn(['stroke-play', 'match-play', 'skins', 'scramble'])
  format?: string;
}