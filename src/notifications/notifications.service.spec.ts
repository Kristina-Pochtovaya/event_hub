import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getQueueToken } from '@nestjs/bull';
import type { Queue } from 'bull';
import { NotificationJob } from './notifications.processor';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getQueueToken('notifications'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationsQueue = module.get(getQueueToken('notifications'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifySubscribed', () => {
    it('should enqueue subscribe notification job', async () => {
      const data: NotificationJob = {
        userId: 'user-1',
        userName: 'John',
        eventId: 'event-1',
        titleEvent: 'Test event',
      };

      await service.notifySubscribed(data);

      expect(notificationsQueue.add).toHaveBeenCalledWith(
        'send-notification-subscribe',
        data,
      );
    });
  });

  describe('notifyUnsubscribed', () => {
    it('should enqueue unsubscribe notification job', async () => {
      const data: NotificationJob = {
        userId: 'user-2',
        userName: 'Alice',
        eventId: 'event-2',
        titleEvent: 'Another event',
      };

      await service.notifyUnsubscribed(data);

      expect(notificationsQueue.add).toHaveBeenCalledWith(
        'send-notification-unsubscribed',
        data,
      );
    });
  });
});
