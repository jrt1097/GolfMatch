import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';
import { Round } from '../rounds/entities/round.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,

    @InjectRepository(Round)
    private roundRepository: Repository<Round>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async leaveRound(roundId: number, userId: number) {
    const round = await this.getRound(roundId);

    if (Number(round.createdByUserId) === Number(userId)) {
      throw new ForbiddenException('Round creator cannot leave their own round');
    }

    const participant = await this.participantRepository.findOne({
      where: { roundId, userId },
    });

    if (!participant) {
      throw new NotFoundException('You are not part of this round');
    }

    await this.participantRepository.remove(participant);

    return { message: 'Left round' };
  }

  async inviteUserByDisplayName(
    roundId: number,
    displayName: string,
    currentUserId: number,
  ) {
    const round = await this.getRound(roundId);

    if (Number(round.createdByUserId) !== Number(currentUserId)) {
      throw new ForbiddenException('Only the round creator can invite users');
    }

    if (!displayName || !displayName.trim()) {
      throw new BadRequestException('Display name is required');
    }

    const userToInvite = await this.userRepository.findOne({
      where: {
        displayName: ILike(displayName.trim()),
      },
    });

    if (!userToInvite) {
      throw new NotFoundException('No user found with that display name');
    }

    if (Number(userToInvite.id) === Number(currentUserId)) {
      throw new ConflictException('You are already in your own round');
    }

    const existing = await this.participantRepository.findOne({
      where: { roundId, userId: userToInvite.id },
    });

    if (existing) {
      throw new ConflictException('User is already connected to this round');
    }

    const participant = this.participantRepository.create({
      roundId,
      userId: userToInvite.id,
      status: 'invited',
    });

    return this.participantRepository.save(participant);
  }

  async getParticipants(roundId: number) {
    await this.getRound(roundId);

    const participants = await this.participantRepository.find({
      where: { roundId },
      order: { id: 'ASC' },
    });

    if (participants.length === 0) {
      return [];
    }

    const users = await this.userRepository.find();

    return participants.map((participant) => {
      const user = users.find(
        (u) => Number(u.id) === Number(participant.userId),
      );

      return {
        id: participant.id,
        roundId: participant.roundId,
        userId: participant.userId,
        status: participant.status,
        displayName: user?.displayName || `Player ${participant.userId}`,
        email: user?.email || null,
      };
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