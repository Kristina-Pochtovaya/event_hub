import { Injectable, NotFoundException } from '@nestjs/common';
import { Subscription } from './subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepo: Repository<Subscription>,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto) {
    const user = await this.usersService.findByUserId(dto.userId);
    const event = await this.eventsService.findOne(dto.eventId);

    const existing = await this.subscriptionsRepo.findOne({
      where: { user: { id: user.id }, event: { id: event.id } },
    });

    if (existing) {
      return existing;
    }

    this.notificationsService.notifySubscribed({
      userId: user.id,
      userName: user.name,
      eventId: event.id,
      titleEvent: event.title,
    });

    const subscription = this.subscriptionsRepo.create({ user, event });
    console.log('SUBSCRIBE CONTROLLER HIT');
    return this.subscriptionsRepo.save(subscription);
  }

  async unsubscribe(dto: CreateSubscriptionDto) {
    const user = await this.usersService.findByUserId(dto.userId);
    const event = await this.eventsService.findOne(dto.eventId);

    const subscription = await this.subscriptionsRepo.findOne({
      where: { user: { id: dto.userId }, event: { id: dto.eventId } },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription is not found');
    }

    this.notificationsService.notifyUnsubscribed({
      userId: user.id,
      userName: user.name,
      eventId: event.id,
      titleEvent: event.title,
    });

    await this.subscriptionsRepo.softDelete(subscription.id);
    return { removed: true };
  }
}
