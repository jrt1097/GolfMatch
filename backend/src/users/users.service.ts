import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Round } from '../rounds/entities/round.entity';
import { Participant } from '../participants/entities/participant.entity';
import { Score } from '../scores/entities/score.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Round)
    private roundRepository: Repository<Round>,

    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,

    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
  ) {}

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateUser(id: number, currentUserId: number, displayName: string) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.displayName = displayName;

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      displayName: savedUser.displayName,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
    };
  }

  async getUserHistory(id: number, currentUserId: number) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only view your own history');
    }

    const participants = await this.participantRepository.find({
      where: { userId: id },
      order: { id: 'DESC' },
    });

    if (participants.length === 0) {
      return [];
    }

    const roundIds = participants.map((p) => p.roundId);

    const rounds = await this.roundRepository.find({
      where: { id: In(roundIds) },
      order: { createdAt: 'DESC' },
    });

    const scores = await this.scoreRepository.find({
      where: { userId: id },
    });

    return rounds.map((round) => {
      const myScore = scores.find((score) => score.roundId === round.id);

      return {
        roundId: round.id,
        courseName: round.courseName,
        scheduledAt: round.scheduledAt,
        format: round.format,
        status: round.status,
        createdByUserId: round.createdByUserId,
        myScore: myScore ? myScore.totalStrokes : null,
      };
    });
  }
}