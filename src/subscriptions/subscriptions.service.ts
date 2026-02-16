import { Injectable, NotFoundException } from '@nestjs/common';
import { Subscription } from './subscription.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { StatsService } from '../stats/stats.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly statsService: StatsService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto) {
    const user = await this.usersService.findByUserId(dto.userId);
    const event = await this.eventsService.findOne(dto.eventId);

    const existing = await this.subscriptionRepo.findOne({
      where: { user: { id: user?.id }, event: { id: event?.id } },
    });

    if (existing) {
      return existing;
    }

    await this.notificationsService.notifySubscribed({
      userId: user.id,
      userName: user.name,
      eventId: event.id,
      titleEvent: event.title,
    });

    const subscription = this.subscriptionRepo.create({ user, event });
    // console.log(subscription, 'Q!');
    const result = await this.subscriptionRepo.save(subscription);
    const count = await this.calculateEventSubscribedStats(event.id);

    await this.statsService.calculateEventSubscribedStats({
      eventId: event.id,
      count,
    });

    return result;
  }

  async calculateEventSubscribedStats(eventId: string): Promise<number> {
    const count = await this.subscriptionRepo.count({
      where: {
        event: { id: eventId },
        deletedAt: IsNull(),
      },
    });

    return count;
  }

  async calculateEventUnsubscribedStats(eventId: string): Promise<number> {
    const count = await this.subscriptionRepo.count({
      where: {
        event: { id: eventId },
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });

    return count;
  }

  async unsubscribe(dto: CreateSubscriptionDto) {
    const user = await this.usersService.findByUserId(dto.userId);
    const event = await this.eventsService.findOne(dto.eventId);

    const subscription = await this.subscriptionRepo.findOne({
      where: { user: { id: dto.userId }, event: { id: dto.eventId } },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription is not found');
    }

    await this.notificationsService.notifyUnsubscribed({
      userId: user.id,
      userName: user.name,
      eventId: event.id,
      titleEvent: event.title,
    });

    await this.subscriptionRepo.softDelete(subscription.id);

    const count = await this.calculateEventUnsubscribedStats(event.id);

    await this.statsService.calculateEventUnubscribedStats({
      eventId: event.id,
      count,
    });

    return { removed: true };
  }
}
