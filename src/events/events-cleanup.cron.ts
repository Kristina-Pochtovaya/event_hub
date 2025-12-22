import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class EventsCleanupCron {
  constructor(
    @InjectQueue('events-cleanup')
    private readonly cleanupQueue: Queue,
  ) {}

  @Cron('0 0 * * *')
  async handleCron() {
    await this.cleanupQueue.add('cleanup-expired-events', {
      runAt: new Date(),
    });
  }
}
