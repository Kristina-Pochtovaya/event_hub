import { SubscriptionsService } from './subscriptions.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let subscriptionRepo: any;
  let statsService: any;
  let usersService: any;
  let eventsService: any;
  let notificationsService: any;

  beforeEach(() => {
    subscriptionRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      softDelete: jest.fn(),
    };
    statsService = {
      calculateEventSubscribedStats: jest.fn(),
      calculateEventUnubscribedStats: jest.fn(),
    };
    usersService = { findByUserId: jest.fn() };
    eventsService = { findOne: jest.fn() };
    notificationsService = {
      notifySubscribed: jest.fn(),
      notifyUnsubscribed: jest.fn(),
    };

    service = new SubscriptionsService(
      subscriptionRepo,
      statsService,
      usersService,
      eventsService,
      notificationsService,
    );
  });

  describe('subscribe', () => {
    it('should create a new subscription if not existing', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      const user = { id: 'u1', name: 'John' };
      const event = { id: 'e1', title: 'Event 1' };
      const subscription = { id: 's1', user, event };

      usersService.findByUserId.mockResolvedValue(user);
      eventsService.findOne.mockResolvedValue(event);
      subscriptionRepo.findOne.mockResolvedValue(undefined);
      subscriptionRepo.create.mockReturnValue(subscription);
      subscriptionRepo.save.mockResolvedValue(subscription);
      subscriptionRepo.count.mockResolvedValue(1);
      statsService.calculateEventSubscribedStats.mockResolvedValue(1);

      const result = await service.subscribe(dto);

      expect(usersService.findByUserId).toHaveBeenCalledWith('u1');
      expect(eventsService.findOne).toHaveBeenCalledWith('e1');
      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'u1' }, event: { id: 'e1' } },
      });
      expect(notificationsService.notifySubscribed).toHaveBeenCalledWith({
        userId: 'u1',
        userName: 'John',
        eventId: 'e1',
        titleEvent: 'Event 1',
      });
      expect(subscriptionRepo.save).toHaveBeenCalledWith(subscription);
      expect(statsService.calculateEventSubscribedStats).toHaveBeenCalledWith({
        eventId: 'e1',
        count: 1,
      });
      expect(result).toEqual(subscription);
    });

    it('should return existing subscription if already exists', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      const existing = { id: 's1' };
      subscriptionRepo.findOne.mockResolvedValue(existing);

      const result = await service.subscribe(dto);

      expect(result).toEqual(existing);
      expect(subscriptionRepo.create).not.toHaveBeenCalled();
      expect(subscriptionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should remove a subscription and notify', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      const user = { id: 'u1', name: 'John' };
      const event = { id: 'e1', title: 'Event 1' };
      const subscription = { id: 's1' };

      usersService.findByUserId.mockResolvedValue(user);
      eventsService.findOne.mockResolvedValue(event);
      subscriptionRepo.findOne.mockResolvedValue(subscription);
      subscriptionRepo.softDelete.mockResolvedValue(undefined);
      subscriptionRepo.count.mockResolvedValue(2);
      statsService.calculateEventUnubscribedStats.mockResolvedValue(2);

      const result = await service.unsubscribe(dto);

      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'u1' }, event: { id: 'e1' } },
      });
      expect(notificationsService.notifyUnsubscribed).toHaveBeenCalledWith({
        userId: 'u1',
        userName: 'John',
        eventId: 'e1',
        titleEvent: 'Event 1',
      });
      expect(subscriptionRepo.softDelete).toHaveBeenCalledWith('s1');
      expect(statsService.calculateEventUnubscribedStats).toHaveBeenCalledWith({
        eventId: 'e1',
        count: 2,
      });
      expect(result).toEqual({ removed: true });
    });

    it('should throw NotFoundException if subscription does not exist', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      subscriptionRepo.findOne.mockResolvedValue(undefined);

      await expect(service.unsubscribe(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
