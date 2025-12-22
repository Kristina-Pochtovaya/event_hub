import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailChannel {
  async send(message) {
    console.log(message);
  }
}
