import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectQueue('import') private readonly importQueue: Queue,
  ) {}

  async getPlatformStats() {
    const [users, events, subscriptions] = await Promise.all([
      this.userRepo.count(),
      this.eventRepo.count(),
      this.subscriptionRepo.count(),
    ]);

    return { users, events, subscriptions };
  }

  async enqueueImport() {
    const job = await this.importQueue.add('importEvents');
    return { jobId: job.id };
  }
}
