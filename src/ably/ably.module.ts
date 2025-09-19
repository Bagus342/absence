import { Global, Module } from '@nestjs/common';
import { AblyService } from './ably.service';

@Global()
@Module({
  providers: [AblyService],
  exports: [AblyService],
})
export class AblyModule {}
