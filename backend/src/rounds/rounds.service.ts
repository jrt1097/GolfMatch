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

  private calculateDistanceMiles(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const earthRadiusMiles = 3958.8;

    const toRadians = (value: number) => {
      return (value * Math.PI) / 180;
    };

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMiles * c;
  }

  async createRound(
    courseName: string,
    scheduledAt: string,
    format: string,
    createdByUserId: number,
    visibility = 'public',
    courseAddress?: string,
    courseLatitude?: number,
    courseLongitude?: number,
    placeId?: string,
  ) {
    const round = this.roundRepository.create({
      courseName,
      courseAddress,
      courseLatitude,
      courseLongitude,
      placeId,
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

  async getNearbyRounds(lat: number, lng: number, radius: number) {
    const rounds = await this.roundRepository.find({
      order: { createdAt: 'DESC' },
    });

    return rounds
      .filter((round) => {
        return (
          round.courseLatitude !== null &&
          round.courseLatitude !== undefined &&
          round.courseLongitude !== null &&
          round.courseLongitude !== undefined
        );
      })
      .map((round) => {
        const distanceMiles = this.calculateDistanceMiles(
          lat,
          lng,
          Number(round.courseLatitude),
          Number(round.courseLongitude),
        );

        return {
          ...round,
          distanceMiles: Number(distanceMiles.toFixed(1)),
        };
      })
      .filter((round: any) => round.distanceMiles <= radius)
      .sort((a: any, b: any) => a.distanceMiles - b.distanceMiles);
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