import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StreaksService } from './streaks.service';

@Controller('streaks')
export class StreaksController {
  constructor(private streaksService: StreaksService) {}

  @Get(':caseId')
  getStreak(@Param('caseId', ParseIntPipe) caseId: number) {
    return this.streaksService.getStreakData(caseId);
  }
}
