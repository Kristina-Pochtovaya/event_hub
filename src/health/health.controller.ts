import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: PinoLogger,
  ) {}

  @Get('liveness')
  liveness() {
    this.logger.debug('Liveness check called');
    return {
      status: 'ok',
      message: 'Service is alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  async readiness() {
    this.logger.debug('Readiness check called');
    let dbAlive = false;

    try {
      await this.dataSource.query('SELECT 1');
      dbAlive = true;
    } catch {
      dbAlive = false;
    }
    return {
      status: dbAlive ? 'ok' : 'error',
      dbAlive,
      timestamp: new Date().toISOString(),
    };
  }
}
