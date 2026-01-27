import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class EmailChannel {
  constructor(private readonly logger: PinoLogger) {}
  async send(message) {
    this.logger.info(message);
  }
}
