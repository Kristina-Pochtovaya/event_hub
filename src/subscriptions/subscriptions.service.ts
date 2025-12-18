import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Subscription } from './subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepo: Repository<Subscription>,
    private usersService: UsersService,
    private eventsService: EventsService,
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

    const subscription = this.subscriptionsRepo.create({ user, event });
    return this.subscriptionsRepo.save(subscription);
  }

  async unsubscribe(dto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { user: { id: dto.userId }, event: { id: dto.eventId } },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription is not found');
    }

    await this.subscriptionsRepo.softDelete(subscription.id);
    return { removed: true };
  }
}
