import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { Score } from './entities/score.entity';
import { Participant } from '../participants/entities/participant.entity';
import { Round } from '../rounds/entities/round.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Score, Participant, Round, User])],
  controllers: [ScoresController],
  providers: [ScoresService],
})
export class ScoresModule {}