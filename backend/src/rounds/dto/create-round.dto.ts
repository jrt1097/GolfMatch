import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateRoundDto {
  @IsString()
  courseName!: string;

  @IsString()
  scheduledAt!: string;

  @IsString()
  format!: string;

  @IsOptional()
  @IsIn(['public', 'invite_only'])
  visibility?: string;
}