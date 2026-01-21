import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { StatsJob } from './stats.processor';

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
