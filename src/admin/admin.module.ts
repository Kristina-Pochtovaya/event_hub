import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EventsModule } from '../events/events.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { BullModule } from '@nestjs/bull';
import { ImportProcessor } from './import.processor';

@Module({
  imports: [
    EventsModule,
    SubscriptionsModule,
    UsersModule,
    BullModule.registerQueue({ name: 'import' }),
    TypeOrmModule.forFeature([User, Event, Subscription]),
  ],
  providers: [AdminService, ImportProcessor],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
