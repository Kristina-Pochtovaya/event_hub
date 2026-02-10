import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './subscription.entity';
import { StatsService } from '../stats/stats.service';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';
import { NotFoundException } from '@nestjs/common';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let subscriptionRepo: Repository<Subscription>;
  let statsService: StatsService;
  let usersService: UsersService;
  let eventsService: EventsService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: StatsService,
          useValue: {
            calculateEventSubscribedStats: jest.fn(),
            calculateEventUnubscribedStats: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
        {
          provide: EventsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            notifySubscribed: jest.fn(),
            notifyUnsubscribed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    subscriptionRepo = module.get<Repository<Subscription>>(
      getRepositoryToken(Subscription),
    );
    statsService = module.get<StatsService>(StatsService);
    usersService = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
    eventsService = module.get<EventsService>(EventsService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  describe('subscribe', () => {
    it('should create a new subscription if not existing', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      const user = { id: 'u1', name: 'John' };
      const event = { id: 'e1', title: 'Event 1' };
      const subscription = { id: 's1', user, event };

      (usersService.findByUserId as jest.Mock).mockResolvedValue(user);
      (eventsService.findOne as jest.Mock).mockResolvedValue(event);
      (subscriptionRepo.findOne as jest.Mock).mockResolvedValue(undefined);
      (subscriptionRepo.create as jest.Mock).mockReturnValue(subscription);
      (subscriptionRepo.save as jest.Mock).mockResolvedValue(subscription);
      (subscriptionRepo.count as jest.Mock).mockResolvedValue(1);
      (
        statsService.calculateEventSubscribedStats as jest.Mock
      ).mockResolvedValue(1);

      const result = await service.subscribe(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findByUserId).toHaveBeenCalledWith('u1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventsService.findOne).toHaveBeenCalledWith('e1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'u1' }, event: { id: 'e1' } },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(subscriptionRepo.create).toHaveBeenCalledWith({ user, event });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(subscriptionRepo.save).toHaveBeenCalledWith(subscription);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(notificationsService.notifySubscribed).toHaveBeenCalledWith({
        userId: 'u1',
        userName: 'John',
        eventId: 'e1',
        titleEvent: 'Event 1',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(statsService.calculateEventSubscribedStats).toHaveBeenCalledWith({
        eventId: 'e1',
        count: 1,
      });
      expect(result).toEqual(subscription);
    });

    it('should return existing subscription if already exists', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      const existing = { id: 's1' };
      (subscriptionRepo.findOne as jest.Mock).mockResolvedValue(existing);

      const result = await service.subscribe(dto);

      expect(result).toEqual(existing);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(subscriptionRepo.create).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(subscriptionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should remove a subscription and notify', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      const user = { id: 'u1', name: 'John' };
      const event = { id: 'e1', title: 'Event 1' };
      const subscription = { id: 's1' };

      (usersService.findByUserId as jest.Mock).mockResolvedValue(user);
      (eventsService.findOne as jest.Mock).mockResolvedValue(event);
      (subscriptionRepo.findOne as jest.Mock).mockResolvedValue(subscription);
      (subscriptionRepo.softDelete as jest.Mock).mockResolvedValue(undefined);
      (subscriptionRepo.count as jest.Mock).mockResolvedValue(2);
      (
        statsService.calculateEventUnubscribedStats as jest.Mock
      ).mockResolvedValue(2);

      const result = await service.unsubscribe(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'u1' }, event: { id: 'e1' } },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(subscriptionRepo.softDelete).toHaveBeenCalledWith('s1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(notificationsService.notifyUnsubscribed).toHaveBeenCalledWith({
        userId: 'u1',
        userName: 'John',
        eventId: 'e1',
        titleEvent: 'Event 1',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(statsService.calculateEventUnubscribedStats).toHaveBeenCalledWith({
        eventId: 'e1',
        count: 2,
      });
      expect(result).toEqual({ removed: true });
    });

    it('should throw NotFoundException if subscription does not exist', async () => {
      const dto: CreateSubscriptionDto = { userId: 'u1', eventId: 'e1' };
      (subscriptionRepo.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.unsubscribe(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
