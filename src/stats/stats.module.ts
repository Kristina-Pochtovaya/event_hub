import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { BullModule } from '@nestjs/bull';
import { StatsProcessor } from './stats.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'stats' })],
  providers: [StatsService, StatsProcessor],
  exports: [StatsService],
})
export class StatsModule {}
