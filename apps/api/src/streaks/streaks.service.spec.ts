import { Test, TestingModule } from '@nestjs/testing';
import { StreaksService } from './streaks.service';
import dayjs from 'dayjs';
import { DayResult } from './dto/streak-response.dto';
import { NotFoundException } from '@nestjs/common';

describe('StreaksService', () => {
  let service: StreaksService;

  const getDay = (daysAgo: number): string => {
    return dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD');
  };

  const generateCaseData = (
    caseId: number,
  ): { date: string; activities: number }[] => {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreaksService],
    }).compile();

    service = module.get<StreaksService>(StreaksService);

    jest
      .spyOn(service as any, 'getCaseData')
      .mockImplementation((caseId: number) => generateCaseData(caseId));
  });

  it('case 1 — 3-day recovery success (SAVED expected)', () => {
    const result = service.getStreakData(1);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach((d) => daysMap.set(d.date, d));

    expect(result.activitiesToday).toBe(3);
    expect(result.total).toBe(2);

    expect(daysMap.get(getDay(3))?.activities).toBe(1);
    expect(daysMap.get(getDay(0))?.state).toBe('SAVED');

    const savedDays = result.days.filter((d) => d.state === 'SAVED');
    expect(savedDays.length).toBeGreaterThanOrEqual(1);
  });

  it('case 2 — recovery ongoing (no SAVE yet)', () => {
    const result = service.getStreakData(2);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach((d) => daysMap.set(d.date, d));

    expect(result.activitiesToday).toBe(1);
    expect(result.total).toBe(3);

    expect(daysMap.get(getDay(4))?.activities).toBe(1);
    expect(daysMap.get(getDay(3))?.activities).toBe(1);
    expect(daysMap.get(getDay(0))?.activities).toBe(1);

    const saved = result.days.find((d) => d.state === 'SAVED');
    expect(saved).toBeUndefined();
  });

  it('case 3 — recovery failed (SAVED exists)', () => {
    const result = service.getStreakData(3);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach((d) => daysMap.set(d.date, d));

    expect(result.activitiesToday).toBe(0);
    expect(result.total).toBe(2);

    expect(daysMap.get(getDay(4))?.activities).toBe(1);
    expect(daysMap.get(getDay(1))?.activities).toBe(3);

    const saved = result.days.find((d) => d.state === 'SAVED');
    expect(saved?.date).toBe(getDay(1));
  });

  it('case 4 — shows AT_RISK after a completed day', () => {
    const result = service.getStreakData(4);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach((d) => daysMap.set(d.date, d));

    expect(daysMap.get(getDay(2))?.state).toBe('COMPLETED');
    expect(daysMap.get(getDay(1))?.state).toBe('AT_RISK');
  });

  it('case 5 — identifies INCOMPLETE days', () => {
    const result = service.getStreakData(5);
    const incompleteDays = result.days.filter((d) => d.state === 'INCOMPLETE');
    expect(incompleteDays.length).toBeGreaterThan(0);
  });

  it('case 6 — SAVED after 2 missed days and 3 activities', () => {
    const result = service.getStreakData(6);
    const savedDays = result.days.filter((d) => d.state === 'SAVED');
    expect(savedDays.length).toBeGreaterThanOrEqual(1);
    expect(savedDays[0].activities).toBeGreaterThanOrEqual(3);
  });

  it('case 7 — future days are marked as INCOMPLETE', () => {
    const result = service.getStreakData(7);
    const futureDates = result.days.filter((d) =>
      dayjs(d.date).isAfter(dayjs()),
    );
    expect(futureDates.every((d) => d.state === 'INCOMPLETE')).toBe(true);
  });
});
