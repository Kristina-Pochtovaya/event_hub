import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [UsersModule, EventsModule, SubscriptionsModule],
  controllers: [AppController],
  providers: [AppService, UsersService],
})
export class AppModule {}
