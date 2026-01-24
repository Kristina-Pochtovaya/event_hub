import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { StatsJob } from './stats.processor';
import type { Queue } from 'bull';

@Injectable()
export class StatsService {
  constructor(@InjectQueue('stats') private readonly statsQueue: Queue) {}

  async calculateEventSubscribedStats(data: StatsJob) {
    await this.statsQueue.add('recalculate-subscriptions', data);
  }

  async calculateEventUnubscribedStats(data: StatsJob) {
    await this.statsQueue.add('recalculate-unsubscriptions', data);
  }
}
