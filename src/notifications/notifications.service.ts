import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { NotificationJob } from './notifications.processor';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async notifySubscribed(data: NotificationJob) {
    await this.notificationsQueue.add('send-notification-subscribe', data, {
      attempts: 3,
      backoff: 10000,
    });
  }

  async notifyUnsubscribed(data: NotificationJob) {
    await this.notificationsQueue.add('send-notification-unsubscribed', data, {
      attempts: 3,
      backoff: 10000,
    });
  }
}
