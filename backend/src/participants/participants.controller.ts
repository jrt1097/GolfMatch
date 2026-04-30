import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rounds')
export class ParticipantsController {
  constructor(private participantsService: ParticipantsService) {}

  @Post(':id/join')
  joinRound(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.participantsService.joinRound(id, req.user.id);
  }

  @Delete(':id/leave')
  leaveRound(
    @Param('id', ParseIntPipe) roundId: number,
    @Request() req: any,
  ) {
    return this.participantsService.leaveRound(roundId, req.user.id);
  }

  @Post(':id/invite')
  inviteUser(
    @Param('id', ParseIntPipe) roundId: number,
    @Body('displayName') displayName: string,
    @Request() req: any,
  ) {
    return this.participantsService.inviteUserByDisplayName(
      roundId,
      displayName,
      req.user.id,
    );
  }

  @Get(':id/participants')
  getParticipants(@Param('id', ParseIntPipe) id: number) {
    return this.participantsService.getParticipants(id);
  }

  @Patch(':id/participants/:participantId')
  updateParticipantStatus(
    @Param('id', ParseIntPipe) roundId: number,
    @Param('participantId', ParseIntPipe) participantId: number,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.participantsService.updateParticipantStatus(
      roundId,
      participantId,
      status,
      req.user.id,
    );
  }

  @Delete(':id/participants/:userId')
  removeParticipant(
    @Param('id', ParseIntPipe) roundId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ) {
    return this.participantsService.removeParticipant(
      roundId,
      userId,
      req.user.id,
    );
  }
}