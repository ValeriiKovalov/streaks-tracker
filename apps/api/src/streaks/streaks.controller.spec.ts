import { Test, TestingModule } from '@nestjs/testing';
import { StreaksController } from './streaks.controller';
import { StreaksService } from './streaks.service';
import { StreakResponseDto } from './dto/streak-response.dto';
import { NotFoundException } from "@nestjs/common";

describe('StreaksController', () => {
  let controller: StreaksController;
  let service: StreaksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreaksController],
      providers: [StreaksService],
    }).compile();

    controller = module.get<StreaksController>(StreaksController);
    service = module.get<StreaksService>(StreaksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw NotFoundException for invalid caseId', async () => {
    await expect(controller.getStreak(999)).rejects.toThrow(NotFoundException);
  });

  it('should return streak data from service', async () => {
    const mockResponse: StreakResponseDto = {
      activitiesToday: 1,
      total: 3,
      days: [
        {
          date: '2025-08-01',
          activities: 1,
          state: 'COMPLETED',
        },
      ],
    };

    const spy = jest
      .spyOn(service, 'getStreakData')
      .mockResolvedValueOnce(mockResponse);

    const caseId = 5;
    const result = await controller.getStreak(caseId);

    expect(spy).toHaveBeenCalledWith(5);
    expect(result).toEqual(mockResponse);
  });
});
