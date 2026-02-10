import { Process, Processor } from '@nestjs/bull';

import type { Job } from 'bull';
import { EmailChannel } from './email.channel';

export type NotificationJob = {
  userName: string;
  userId: string;
  titleEvent: string;
  eventId: string;
};

@Processor('notifications')
export class NotificationsProcessor {
  constructor(private readonly emailChannel: EmailChannel) {}
  @Process('send-notification-subscribe')
  async sendNotificationSubscribe(job: Job<NotificationJob>) {
    const { userName, userId, titleEvent, eventId } = job.data;

    this.emailChannel.send(
      `User ${userName} ${userId} is subscribed on event: ${titleEvent} ${eventId}`,
    );
    await job.log(
      `User ${userName} ${userId} is subscribed on event: ${titleEvent} ${eventId}`,
    );
  }

  @Process('send-notification-unsubscribed')
  async sendNotificationUnsubscribe(job: Job<NotificationJob>) {
    const { userName, userId, titleEvent, eventId } = job.data;

    this.emailChannel.send(
      `User ${userName} ${userId} is unsubscribed on event: ${titleEvent} ${eventId}`,
    );
    await job.log(
      `User ${userName} ${userId} is unsubscribed on event: ${titleEvent} ${eventId}`,
    );
  }
}
