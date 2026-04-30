import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Round } from '../rounds/entities/round.entity';
import { Participant } from '../participants/entities/participant.entity';
import { Score } from '../scores/entities/score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Round, Participant, Score])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule],
})
export class UsersModule {}