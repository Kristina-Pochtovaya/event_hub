import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post('subscribe')
  subscribe(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.subscribe(dto);
  }

  @Delete('unsubscribe')
  unsubscribe(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.unsubscribe(dto);
  }
}
