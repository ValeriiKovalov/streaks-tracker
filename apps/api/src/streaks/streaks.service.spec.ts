import { Test, TestingModule } from '@nestjs/testing';
import { StreaksService } from './streaks.service';
import * as dayjs from 'dayjs';
import { DayResult } from './dto/streak-response.dto';

describe('StreaksService', () => {
  let service: StreaksService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreaksService],
    }).compile();

    service = module.get<StreaksService>(StreaksService);
  });

  const getDay = (daysAgo: number): string => {
    return dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD');
  };

  it('case 1 — 3-day recovery success (SAVED expected)', async () => {
    const result = await service.getStreakData(1);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach(d => daysMap.set(d.date, d));

    expect(result.activitiesToday).toBe(3);
    expect(result.total).toBe(2);

    expect(daysMap.get(getDay(3))?.activities).toBe(1);
    expect(daysMap.get(getDay(0))?.state).toBe('SAVED');

    const savedDays = result.days.filter(d => d.state === 'SAVED');
    expect(savedDays.length).toBeGreaterThanOrEqual(1);
  });

  it('case 2 — recovery ongoing (no SAVE yet)', async () => {
    const result = await service.getStreakData(2);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach(d => daysMap.set(d.date, d));

    expect(result.activitiesToday).toBe(1);
    expect(result.total).toBe(3);

    expect(daysMap.get(getDay(4))?.activities).toBe(1);
    expect(daysMap.get(getDay(3))?.activities).toBe(1);
    expect(daysMap.get(getDay(0))?.activities).toBe(1);

    const saved = result.days.find(d => d.state === 'SAVED');
    expect(saved).toBeUndefined();
  });

  it('case 3 — recovery failed (SAVED exists)', async () => {
    const result = await service.getStreakData(3);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach(d => daysMap.set(d.date, d));

    expect(result.activitiesToday).toBe(0);
    expect(result.total).toBe(2);

    expect(daysMap.get(getDay(4))?.activities).toBe(1);
    expect(daysMap.get(getDay(1))?.activities).toBe(3);

    const saved = result.days.find(d => d.state === 'SAVED');
    expect(saved?.date).toBe(getDay(1));
  });

  it('case 4 — shows AT_RISK after a completed day', async () => {
    const result = await service.getStreakData(4);
    const daysMap = new Map<string, DayResult>();
    result.days.forEach(d => daysMap.set(d.date, d));

    expect(daysMap.get(getDay(2))?.state).toBe('COMPLETED');
    expect(daysMap.get(getDay(1))?.state).toBe('AT_RISK');
  });

  it('case 5 — identifies INCOMPLETE days', async () => {
    const result = await service.getStreakData(5);
    const incompleteDays = result.days.filter(d => d.state === 'INCOMPLETE');
    expect(incompleteDays.length).toBeGreaterThan(0);
  });

  it('case 6 — SAVED after 2 missed days and 3 activities', async () => {
    const result = await service.getStreakData(6);
    const savedDays = result.days.filter(d => d.state === 'SAVED');
    expect(savedDays.length).toBeGreaterThanOrEqual(1);
    expect(savedDays[0].activities).toBeGreaterThanOrEqual(3);
  });

  it('case 7 — future days are marked as INCOMPLETE', async () => {
    const result = await service.getStreakData(7);
    const futureDates = result.days.filter(d => dayjs(d.date).isAfter(dayjs()));
    expect(futureDates.every(d => d.state === 'INCOMPLETE')).toBe(true);
  });
});
