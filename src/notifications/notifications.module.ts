import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { BullModule } from '@nestjs/bull';
import { EmailChannel } from './email.channel';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' })],
  providers: [NotificationsService, NotificationsProcessor, EmailChannel],
  exports: [NotificationsService],
})
export class NotificationsModule {}
