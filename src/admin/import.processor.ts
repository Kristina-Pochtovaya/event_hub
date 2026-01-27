import { Process, Processor } from '@nestjs/bull';
import { EventsService } from '../events/events.service';
import type { Job } from 'bull';
import { PinoLogger } from 'nestjs-pino';

@Processor('import')
export class ImportProcessor {
  constructor(
    private readonly eventsService: EventsService,
    private readonly logger: PinoLogger,
  ) {}

  @Process('importEvents')
  async handleImport(job: Job) {
    const events = await this.eventsService.findAll();

    this.logger.info(`Imported: ${events.length} events`);
    await job.log(`Imported: ${events.length} events`);

    return {
      total: events.length,
      events,
    };
  }
}
