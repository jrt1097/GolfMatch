import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoresService } from './scores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rounds')
export class ScoresController {
  constructor(private scoresService: ScoresService) {}

  @Post(':id/scores')
  submitScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateScoreDto,
    @Request() req: any,
  ) {
    return this.scoresService.submitScore(
      id,
      req.user.id,
      body.totalStrokes,
    );
  }

  @Get(':id/scores')
  getScores(@Param('id', ParseIntPipe) id: number) {
    return this.scoresService.getScores(id);
  }

  @Patch(':id/scores/:scoreId')
  updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Param('scoreId', ParseIntPipe) scoreId: number,
    @Body() body: UpdateScoreDto,
    @Request() req: any,
  ) {
    return this.scoresService.updateScore(
      id,
      scoreId,
      req.user.id,
      body.totalStrokes,
    );
  }

  @Get(':id/results')
  getResults(@Param('id', ParseIntPipe) id: number) {
    return this.scoresService.getResults(id);
  }
}