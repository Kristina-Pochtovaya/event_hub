import { Process, Processor } from '@nestjs/bull';

import type { Job } from 'bull';
import { EventsService } from './events.service';

export type EventsCleanupJob = {
  titleEvent: string;
  eventId: string;
  endDate: Date;
};

@Processor('events-cleanup')
export class EventsCleanupProcessor {
  constructor(private readonly eventsService: EventsService) {}

  @Process('cleanup-expired-events')
  async cleanupExpiredEvents(job: Job<EventsCleanupJob>) {
    const count = await this.eventsService.cleanupExpiredEvents();

    await job.log(`Cleaned ${count} expired events`);

    return {
      cleaned: count,
    };
  }
}
