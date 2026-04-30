import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from './entities/round.entity';
import { Participant } from '../participants/entities/participant.entity';

@Injectable()
export class RoundsService {
  constructor(
    @InjectRepository(Round)
    private roundRepository: Repository<Round>,

    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
  ) {}

  async createRound(
    courseName: string,
    scheduledAt: string,
    format: string,
    createdByUserId: number,
    visibility = 'public',
  ) {
    const round = this.roundRepository.create({
      courseName,
      scheduledAt,
      format,
      createdByUserId,
      visibility,
      status: 'open',
    });

    const savedRound = await this.roundRepository.save(round);

    const participant = this.participantRepository.create({
      roundId: savedRound.id,
      userId: createdByUserId,
      status: 'accepted',
    });

    await this.participantRepository.save(participant);

    return savedRound;
  }

  async getRounds() {
    return this.roundRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getRoundById(id: number) {
    const round = await this.roundRepository.findOne({
      where: { id },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    return round;
  }

  async updateRound(
    id: number,
    currentUserId: number,
    updateData: any,
  ) {
    const round = await this.getRoundById(id);

    if (Number(round.createdByUserId) !== Number(currentUserId)) {
      throw new ForbiddenException('Only creator can update this round');
    }

    Object.assign(round, updateData);

    return this.roundRepository.save(round);
  }

  async deleteRound(id: number, currentUserId: number) {
    const round = await this.getRoundById(id);

    if (Number(round.createdByUserId) !== Number(currentUserId)) {
      throw new ForbiddenException('Only creator can delete this round');
    }

    await this.roundRepository.remove(round);

    return { message: 'Round deleted' };
  }

  async updateStatus(
    id: number,
    currentUserId: number,
    status: string,
  ) {
    const round = await this.getRoundById(id);

    if (Number(round.createdByUserId) !== Number(currentUserId)) {
      throw new ForbiddenException('Only creator can change status');
    }

    round.status = status;

    return this.roundRepository.save(round);
  }
}