import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { Round } from '../rounds/entities/round.entity';
import { User } from '../users/entities/user.entity';
import { Score } from './entities/score.entity';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,

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

  async submitScore(
    roundId: number,
    userId: number,
    totalStrokes: number,
  ) {
    const round = await this.getRound(roundId);

    if (round.status === 'completed') {
      throw new ForbiddenException('Round is completed. Scores are locked.');
    }

    const participant = await this.participantRepository.findOne({
      where: {
        roundId,
        userId,
        status: 'accepted',
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You must join the round before submitting a score',
      );
    }

    const existingScore = await this.scoreRepository.findOne({
      where: { roundId, userId },
    });

    if (existingScore) {
      throw new ConflictException('You already submitted a score');
    }

    const score = this.scoreRepository.create({
      roundId,
      userId,
      totalStrokes,
    });

    return this.scoreRepository.save(score);
  }

  async updateScore(
    roundId: number,
    scoreId: number,
    userId: number,
    totalStrokes: number,
  ) {
    const round = await this.getRound(roundId);

    if (round.status === 'completed') {
      throw new ForbiddenException('Round is completed. Scores are locked.');
    }

    const score = await this.scoreRepository.findOne({
      where: {
        id: scoreId,
        roundId,
      },
    });

    if (!score) {
      throw new NotFoundException('Score not found');
    }

    if (score.userId !== userId) {
      throw new ForbiddenException('You can only update your own score');
    }

    score.totalStrokes = totalStrokes;

    return this.scoreRepository.save(score);
  }

  async getScores(roundId: number) {
    const scores = await this.scoreRepository.find({
      where: { roundId },
      order: { totalStrokes: 'ASC' },
    });

    return Promise.all(
      scores.map(async (score) => {
        const user = await this.userRepository.findOne({
          where: { id: score.userId },
        });

        return {
          ...score,
          displayName: user?.displayName || 'Unknown Player',
        };
      }),
    );
  }

  async getResults(roundId: number) {
    const scores = await this.getScores(roundId);

    if (scores.length === 0) {
      return {
        message: 'No scores yet',
      };
    }

    const lowest = Math.min(...scores.map((s) => s.totalStrokes));
    const winners = scores.filter((s) => s.totalStrokes === lowest);

    return {
      roundId,
      totalPlayers: scores.length,
      winningScore: lowest,
      isTie: winners.length > 1,
      winners,
    };
  }
}