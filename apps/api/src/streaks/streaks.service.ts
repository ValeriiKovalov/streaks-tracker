import { Injectable, NotFoundException } from '@nestjs/common';
import { StreakResponseDto, DayResult } from './dto/streak-response.dto';
import dayjs from 'dayjs';
import * as data from './activity-data.json';

@Injectable()
export class StreaksService {
  private getCaseData(caseId: number): { date: string; activities: number }[] {
    const caseKey = caseId.toString();
    const today = dayjs().startOf('day');

    const relativeEntries = (
      data as Record<string, { daysAgo: number; activities: number }[]>
    )[caseKey];

    if (!relativeEntries) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    return relativeEntries.map(({ daysAgo, activities }) => ({
      date: today.subtract(daysAgo, 'day').format('YYYY-MM-DD'),
      activities,
    }));
  }

  getStreakData(caseId: number): StreakResponseDto {
    const rawActivities = this.getCaseData(caseId);

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

    const todayEntry = days.find((d) => d.date === today.format('YYYY-MM-DD'));
    return {
      activitiesToday: todayEntry?.activities || 0,
      total,
      days: days.reverse(),
    };
  }
}
