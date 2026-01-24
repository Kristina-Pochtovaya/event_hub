import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { Subscription } from '../subscriptions/subscription.entity';

describe('AdminService', () => {
  let service: AdminService;

  const userRepo = {
    count: jest.fn(),
  };

  const eventRepo = {
    count: jest.fn(),
  };

  const subscriptionRepo = {
    count: jest.fn(),
  };

  const importQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: eventRepo,
        },
        {
          provide: getRepositoryToken(Subscription),
          useValue: subscriptionRepo,
        },
        {
          provide: getQueueToken('import'),
          useValue: importQueue,
        },
      ],
    }).compile();

    service = module.get(AdminService);

    jest.clearAllMocks();
  });

  describe('getPlatformStats', () => {
    it('should return aggregated platform stats', async () => {
      userRepo.count.mockResolvedValue(10);
      eventRepo.count.mockResolvedValue(5);
      subscriptionRepo.count.mockResolvedValue(20);

      const result = await service.getPlatformStats();

      expect(result).toEqual({
        users: 10,
        events: 5,
        subscriptions: 20,
      });

      expect(userRepo.count).toHaveBeenCalledTimes(1);
      expect(eventRepo.count).toHaveBeenCalledTimes(1);
      expect(subscriptionRepo.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('enqueueImport', () => {
    it('should enqueue importEvents job and return jobId', async () => {
      importQueue.add.mockResolvedValue({ id: 'job-123' });

      const result = await service.enqueueImport();

      expect(importQueue.add).toHaveBeenCalledWith('importEvents');
      expect(result).toEqual({ jobId: 'job-123' });
    });
  });
});
