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
  async sendNotificationSubscribe(job: Job<EventsCleanupJob>) {
    const { titleEvent, eventId, endDate } = job.data;

    const count = await this.eventsService.cleanupExpiredEvents();

    await job.log(`User ${titleEvent} ${eventId} is expired and deleted`);

    return {
      cleaned: count,
    };
  }
}
