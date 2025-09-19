import { Injectable } from '@nestjs/common';
import * as Ably from 'ably';

@Injectable()
export class AblyService {
  private client: Ably.Realtime;

  constructor() {
    this.client = new Ably.Realtime(`${process.env.ABLY_KEY}`);
  }

  async publish(name: string, event: string, data: any) {
    const channel = this.client.channels.get(name);
    await channel.publish(event, data);
  }

  async getHistory(name: string) {
    const channel = this.client.channels.get(name);
    const history = await channel.history();
    console.log(history.items);
    return history.items;
  }
}
