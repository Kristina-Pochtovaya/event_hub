import { Process, Processor } from '@nestjs/bull';

import type { Job } from 'bull';
import { PinoLogger } from 'nestjs-pino';

export type StatsJob = {
  count: number;
  eventId: string;
};

@Processor('stats')
export class StatsProcessor {
  constructor(private readonly logger: PinoLogger) {}

  @Process('recalculate-subscriptions')
  async recalculateSubscriptions(job: Job<StatsJob>) {
    const { eventId, count } = job.data;

    this.logger.info(`Event ${eventId} has: ${count} subscriptions`);

    await job.log(`Event ${eventId} has: ${count} subscriptions`);
  }

  @Process('recalculate-unsubscriptions')
  async recalculateUnsSubscriptions(job: Job<StatsJob>) {
    const { eventId, count } = job.data;

    this.logger.info(`Event ${eventId} has: ${count} unsubscriptions`);

    await job.log(`Event ${eventId} has: ${count} unsubscriptions`);
  }
}
