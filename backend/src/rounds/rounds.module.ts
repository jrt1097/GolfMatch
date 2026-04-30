import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundsController } from './rounds.controller';
import { RoundsService } from './rounds.service';
import { Round } from './entities/round.entity';
import { Participant } from '../participants/entities/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Round, Participant])],
  controllers: [RoundsController],
  providers: [RoundsService],
})
export class RoundsModule {}