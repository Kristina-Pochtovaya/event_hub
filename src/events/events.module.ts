import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bull';
import { EventsCleanupCron } from './events-cleanup.cron';
import { EventsCleanupProcessor } from './events-cleanup.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'events-cleanup' }),
    TypeOrmModule.forFeature([Event]),
    UsersModule,
  ],
  providers: [EventsService, EventsCleanupCron, EventsCleanupProcessor],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
