import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}
  @Get('liveness')
  liveness() {
    return {
      status: 'ok',
      message: 'Service is alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  async readiness() {
    let dbAlive = false;

    try {
      await this.dataSource.query('SELECT 1');
      dbAlive = true;
    } catch (err) {
      dbAlive = false;
    }
    return {
      status: dbAlive ? 'ok' : 'error',
      dbAlive,
      timestamp: new Date().toISOString(),
    };
  }
}
