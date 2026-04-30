import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { Participant } from './entities/participant.entity';
import { Round } from '../rounds/entities/round.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participant, Round, User])],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
})
export class ParticipantsModule {}