import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { getQueueToken } from '@nestjs/bull';

describe('StatsService', () => {
  let service: StatsService;

  const statsQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getQueueToken('stats'),
          useValue: statsQueue,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enqueue subscriptions job', async () => {
    const data = { eventId: '1', count: 5 };
    await service.calculateEventSubscribedStats(data);

    expect(statsQueue.add).toHaveBeenCalledWith(
      'recalculate-subscriptions',
      data,
      { attempts: 3, backoff: 10000 },
    );
  });

  it('should enqueue unsubscriptions job', async () => {
    const data = { eventId: '2', count: 3 };
    await service.calculateEventUnubscribedStats(data);

    expect(statsQueue.add).toHaveBeenCalledWith(
      'recalculate-unsubscriptions',
      data,
      { attempts: 3, backoff: 10000 },
    );
  });
});
