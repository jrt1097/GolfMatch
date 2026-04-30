import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';
import { Round } from '../rounds/entities/round.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,

    @InjectRepository(Round)
    private roundRepository: Repository<Round>,
  ) {}

  private async getRound(roundId: number) {
    const round = await this.roundRepository.findOne({
      where: { id: roundId },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    return round;
  }

  async joinRound(roundId: number, userId: number) {
    const round = await this.getRound(roundId);

    if (round.visibility === 'invite_only') {
      throw new ForbiddenException('This round is invite only');
    }

    if (round.status !== 'open') {
      throw new ConflictException('Only open rounds can be joined');
    }

    const existing = await this.participantRepository.findOne({
      where: { roundId, userId },
    });

    if (existing) {
      throw new ConflictException('Already joined this round');
    }

    const participant = this.participantRepository.create({
      roundId,
      userId,
      status: 'accepted',
    });

    return this.participantRepository.save(participant);
  }

  async inviteUser(
    roundId: number,
    userIdToInvite: number,
    currentUserId: number,
  ) {
    const round = await this.getRound(roundId);

    if (Number(round.createdByUserId) !== Number(currentUserId)) {
      throw new ForbiddenException('Only the round creator can invite users');
    }

    const existing = await this.participantRepository.findOne({
      where: { roundId, userId: userIdToInvite },
    });

    if (existing) {
      throw new ConflictException('User is already connected to this round');
    }

    const participant = this.participantRepository.create({
      roundId,
      userId: userIdToInvite,
      status: 'invited',
    });

    return this.participantRepository.save(participant);
  }

  async getParticipants(roundId: number) {
    await this.getRound(roundId);

    return this.participantRepository.find({
      where: { roundId },
      order: { id: 'ASC' },
    });
  }

  async updateParticipantStatus(
    roundId: number,
    participantId: number,
    status: string,
    currentUserId: number,
  ) {
    const allowedStatuses = ['invited', 'accepted', 'declined'];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        'Status must be invited, accepted, or declined',
      );
    }

    const round = await this.getRound(roundId);

    const participant = await this.participantRepository.findOne({
      where: { id: participantId, roundId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const isCreator = Number(round.createdByUserId) === Number(currentUserId);
    const isOwnParticipantRecord =
      Number(participant.userId) === Number(currentUserId);

    if (!isCreator && !isOwnParticipantRecord) {
      throw new ForbiddenException(
        'You are not allowed to update this participant',
      );
    }

    participant.status = status;

    return this.participantRepository.save(participant);
  }

  async removeParticipant(
    roundId: number,
    userIdToRemove: number,
    currentUserId: number,
  ) {
    const round = await this.getRound(roundId);

    if (Number(round.createdByUserId) !== Number(currentUserId)) {
      throw new ForbiddenException(
        'Only the round creator can remove participants',
      );
    }

    const participant = await this.participantRepository.findOne({
      where: { roundId, userId: userIdToRemove },
    });

    if (!participant) {
      throw new BadRequestException('Participant not found');
    }

    if (Number(currentUserId) === Number(userIdToRemove)) {
      throw new ForbiddenException('You cannot remove yourself');
    }

    await this.participantRepository.remove(participant);

    return { message: 'Participant removed' };
  }

  async isParticipant(roundId: number, userId: number) {
    const participant = await this.participantRepository.findOne({
      where: { roundId, userId },
    });

    return !!participant;
  }
}