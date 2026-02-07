import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

describe('StatsService', () => {
  let service: StatsService;
  let statsQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getQueueToken('stats'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    statsQueue = module.get(getQueueToken('stats'));
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
