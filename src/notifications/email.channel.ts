import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class EmailChannel {
  constructor(private readonly logger: PinoLogger) {}
  send(message: string) {
    this.logger.info(message);
  }
}
