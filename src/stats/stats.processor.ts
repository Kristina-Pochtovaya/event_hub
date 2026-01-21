import { Process, Processor } from '@nestjs/bull';

import type { Job } from 'bull';

export type StatsJob = {
  count: number;
  eventId: string;
};

@Processor('stats')
export class StatsProcessor {
  @Process('recalculate-subscriptions')
  async recalculateSubscriptions(job: Job<StatsJob>) {
    const { eventId, count } = job.data;

    console.log(`Event ${eventId} has: ${count} subscriptions`);

    await job.log(`Event ${eventId} has: ${count} subscriptions`);
  }

  @Process('recalculate-unsubscriptions')
  async recalculateUnsSubscriptions(job: Job<StatsJob>) {
    const { eventId, count } = job.data;

    console.log(`Event ${eventId} has: ${count} unsubscriptions`);

    await job.log(`Event ${eventId} has: ${count} unsubscriptions`);
  }
}
