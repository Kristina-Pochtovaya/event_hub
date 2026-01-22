import { Process, Processor } from '@nestjs/bull';
import { EventsService } from '../events/events.service';
import type { Job } from 'bull';

@Processor('import')
export class ImportProcessor {
  constructor(private readonly eventsService: EventsService) {}

  @Process('importEvents')
  async handleImport(job: Job) {
    const events = await this.eventsService.findAll();

    console.log(`Imported: ${events.length} events`);
    await job.log(`Imported: ${events.length} events`);

    return {
      total: events.length,
      events,
    };
  }
}
