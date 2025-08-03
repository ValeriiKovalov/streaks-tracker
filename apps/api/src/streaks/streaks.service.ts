import { Injectable, NotFoundException } from '@nestjs/common';
import { StreakResponseDto, DayResult } from './dto/streak-response.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class StreaksService {
  // Mocked answer data from DB
  private generateCaseData(caseId: number): { date: string; activities: number }[] {
    const today = dayjs().startOf('day');

    if (caseId === 1) {
      return [
        { date: today.subtract(3, 'day').format('YYYY-MM-DD'), activities: 1 },
        { date: today.format('YYYY-MM-DD'), activities: 3 },
      ];
    }

    if (caseId === 2) {
      return [
        { date: today.subtract(4, 'day').format('YYYY-MM-DD'), activities: 1 },
        { date: today.subtract(3, 'day').format('YYYY-MM-DD'), activities: 1 },
        { date: today.format('YYYY-MM-DD'), activities: 1 },
      ];
    }

    if (caseId === 3) {
      return [
        { date: today.subtract(4, 'day').format('YYYY-MM-DD'), activities: 1 },
        { date: today.subtract(1, 'day').format('YYYY-MM-DD'), activities: 3 },
      ];
    }

    if (caseId === 4) {
      return [
        { date: today.subtract(2, 'day').format('YYYY-MM-DD'), activities: 1 },
      ];
    }

    if (caseId === 5) {
      return [
        { date: today.subtract(6, 'day').format('YYYY-MM-DD'), activities: 0 },
        { date: today.subtract(5, 'day').format('YYYY-MM-DD'), activities: 0 },
        { date: today.subtract(4, 'day').format('YYYY-MM-DD'), activities: 1 },
      ];
    }

    if (caseId === 6) {
      return [
        { date: today.subtract(3, 'day').format('YYYY-MM-DD'), activities: 3 },
        { date: today.subtract(6, 'day').format('YYYY-MM-DD'), activities: 1 },
      ];
    }

    if (caseId === 7) {
      return [
        { date: today.add(1, 'day').format('YYYY-MM-DD'), activities: 10 },
      ];
    }


    throw new NotFoundException(`Case with ID ${caseId} not found`);
  }

  async getStreakData(caseId: number): Promise<StreakResponseDto> {
    const rawActivities = this.generateCaseData(caseId);

    const today = dayjs().startOf('day');
    const lookup = new Map<string, number>();
    rawActivities.forEach(({ date, activities }) => {
      lookup.set(date, (lookup.get(date) || 0) + activities);
    });

    const days: DayResult[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const key = date.format('YYYY-MM-DD');
      const count = lookup.get(key) || 0;

      days.push({
        date: key,
        activities: count,
        state: 'INCOMPLETE',
      });
    }

    let total = 0;

    for (const d of days) {
      if (d.activities >= 1) {
        d.state = 'COMPLETED';
        total++;
      }
    }

    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1];
      const curr = days[i];
      if (prev.state === 'COMPLETED' && curr.activities === 0) {
        curr.state = 'AT_RISK';
      }
    }

    for (let i = 0; i < days.length; i++) {
      const curr = days[i];

      if (
        i >= 2 &&
        days[i - 2].state === 'COMPLETED' &&
        days[i - 1].activities === 0 &&
        curr.activities >= 2
      ) {
        curr.state = 'SAVED';
        continue;
      }

      if (
        i >= 3 &&
        days[i - 3].state === 'COMPLETED' &&
        days[i - 2].activities === 0 &&
        days[i - 1].activities === 0 &&
        curr.activities >= 3
      ) {
        curr.state = 'SAVED';
      }
    }

    for (const d of days) {
      if (
        d.state !== 'COMPLETED' &&
        d.state !== 'AT_RISK' &&
        d.state !== 'SAVED'
      ) {
        d.state = 'INCOMPLETE';
      }
    }

    const todayEntry = days.find(d => d.date === today.format('YYYY-MM-DD'));
    return {
      activitiesToday: todayEntry?.activities || 0,
      total,
      days: days.reverse(),
    };
  }
}
