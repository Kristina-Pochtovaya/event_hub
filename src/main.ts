import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Logger } from 'nestjs-pino/Logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const notificationsQueue = app.get<Queue>(getQueueToken('notifications'));
  const eventsCleanupQueue = app.get<Queue>(getQueueToken('events-cleanup'));
  const importsQueue = app.get<Queue>(getQueueToken('import'));
  const statsQueue = app.get<Queue>(getQueueToken('stats'));
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [
      new BullAdapter(notificationsQueue),
      new BullAdapter(importsQueue),
      new BullAdapter(eventsCleanupQueue),
      new BullAdapter(statsQueue),
    ],
    serverAdapter: serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useLogger(app.get(Logger));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
  process.exit(1);
});
