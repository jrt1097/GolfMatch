import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoundDto } from './dto/create-round.dto';
import { UpdateRoundDto } from './dto/update-round.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('rounds')
export class RoundsController {
  constructor(private roundsService: RoundsService) {}

  @Post()
  createRound(@Body() body: CreateRoundDto, @Request() req: any) {
    return this.roundsService.createRound(
      body.courseName,
      body.scheduledAt,
      body.format,
      req.user.id,
      body.visibility,
      body.courseAddress,
      body.courseLatitude,
      body.courseLongitude,
      body.placeId,
    );
  }

  @Get()
  getRounds() {
    return this.roundsService.getRounds();
  }

  @Get('nearby')
  getNearbyRounds(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return this.roundsService.getNearbyRounds(
      Number(lat),
      Number(lng),
      Number(radius || 25),
    );
  }

  @Get(':id')
  getRoundById(@Param('id', ParseIntPipe) id: number) {
    return this.roundsService.getRoundById(id);
  }

  @Patch(':id')
  updateRound(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoundDto,
    @Request() req: any,
  ) {
    return this.roundsService.updateRound(id, req.user.id, body);
  }

  @Delete(':id')
  deleteRound(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.roundsService.deleteRound(id, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusDto,
    @Request() req: any,
  ) {
    return this.roundsService.updateStatus(
      id,
      req.user.id,
      body.status,
    );
  }
}