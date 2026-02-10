import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getQueueToken } from '@nestjs/bull';
import { BullExplorerMock, createQueueMock } from './mocks/bullmq.mock';
import { BullExplorer } from '@nestjs/bull/dist/bull.explorer';
import { jwtDecode } from 'jwt-decode';
import { EventsCleanupCron } from '../src/events/events-cleanup.cron';

const PASSWORD = '12345';
const retry = { attempts: 3, backoff: 10000 };

type LoginResponse = {
  access_token: string;
};

type EventResponse = {
  id: string;
  title: string;
};

type NotificationPayload = {
  userId: string;
  userName: string;
  eventId: string;
  titleEvent: string;
};
type JwtPayload = {
  sub: string;
};

jest.mock('bcrypt', () => ({
  compare: jest.fn((password) => password === PASSWORD),
}));

describe('EventHub (e2e)', () => {
  let app: INestApplication<App>;

  const statsQueue = createQueueMock();
  const notificationsQueue = createQueueMock();
  const importQueue = createQueueMock();
  const eventsCleanupQueue = createQueueMock();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BullExplorer)
      .useClass(BullExplorerMock)
      .overrideProvider(getQueueToken('stats'))
      .useValue(statsQueue)
      .overrideProvider(getQueueToken('notifications'))
      .useValue(notificationsQueue)
      .overrideProvider(getQueueToken('import'))
      .useValue(importQueue)
      .overrideProvider(getQueueToken('events-cleanup'))
      .useValue(eventsCleanupQueue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('subscribe → enqueue notification + subscription stats', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@admin.com', password: PASSWORD });

    const loginBody = login.body as LoginResponse;
    const accessToken: string = loginBody.access_token;

    const payload = jwtDecode<JwtPayload>(accessToken);
    const userId = payload.sub;

    const event = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userId,
        title: 'test item',
        description: 'test subscription',
      });

    const eventBody = event.body as EventResponse;
    const eventId = eventBody.id;
    const titleEvent = eventBody.title;

    await request(app.getHttpServer())
      .post('/subscriptions/subscribe')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userId,
        eventId,
      })
      .expect(201);

    expect(notificationsQueue.add).toHaveBeenCalledWith(
      'send-notification-subscribe',

      expect.objectContaining<NotificationPayload>({
        userId: expect.stringMatching(/\S+/) as string,
        userName: expect.stringMatching(/\S+/) as string,
        eventId,
        titleEvent,
      }),
      retry,
    );

    expect(statsQueue.add).toHaveBeenCalledWith(
      'recalculate-subscriptions',
      expect.objectContaining({
        eventId,
        count: expect.anything() as number,
      }),
      retry,
    );
  });

  it('unsubscribe → enqueue notification + unsubscription stats', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@admin.com', password: PASSWORD });

    const loginBody = login.body as LoginResponse;
    const accessToken = loginBody.access_token;
    const payload = jwtDecode<JwtPayload>(accessToken);
    const userId = payload.sub;

    const event = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userId,
        title: 'test item',
        description: 'test subscription',
      });

    const eventBody = event.body as EventResponse;
    const eventId = eventBody.id;
    const titleEvent = eventBody.title;

    await request(app.getHttpServer())
      .post('/subscriptions/subscribe')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userId,
        eventId,
      });

    await request(app.getHttpServer())
      .delete('/subscriptions/unsubscribe')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userId,
        eventId,
      })
      .expect(200);

    expect(notificationsQueue.add).toHaveBeenCalledWith(
      'send-notification-unsubscribed',
      expect.objectContaining({
        userId: expect.stringMatching(/\S+/) as string,
        userName: expect.stringMatching(/\S+/) as string,
        eventId,
        titleEvent,
      }),
      retry,
    );

    expect(statsQueue.add).toHaveBeenCalledWith(
      'recalculate-unsubscriptions',
      expect.objectContaining({
        eventId,
        count: expect.anything() as number,
      }),
      retry,
    );
  });

  it('admin enqueue import events job', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@admin.com', password: PASSWORD });

    const loginBody = login.body as LoginResponse;
    const accessToken = loginBody.access_token;

    const res = await request(app.getHttpServer())
      .post('/admin/events/import')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(importQueue.add).toHaveBeenCalledWith('importEvents');
    expect(res.body).toHaveProperty('jobId');
  });

  it('cron enqueues cleanup-expired-events job', async () => {
    const cron = app.get(EventsCleanupCron);

    await cron.handleCron();

    expect(eventsCleanupQueue.add).toHaveBeenCalledWith(
      'cleanup-expired-events',
      expect.objectContaining({ runAt: expect.anything() as Date }),
      retry,
    );
  });
});
