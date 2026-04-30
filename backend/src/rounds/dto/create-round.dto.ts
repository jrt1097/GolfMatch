import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoundDto {
  @IsString()
  courseName!: string;

  @IsOptional()
  @IsString()
  courseAddress?: string;

  @IsOptional()
  @IsLatitude()
  courseLatitude?: number;

  @IsOptional()
  @IsLongitude()
  courseLongitude?: number;

  @IsOptional()
  @IsString()
  placeId?: string;

  @IsString()
  scheduledAt!: string;

  @IsString()
  format!: string;

  @IsOptional()
  @IsIn(['public', 'invite_only'])
  visibility?: string;
}