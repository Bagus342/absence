import { Module } from '@nestjs/common';
import { AbsenService } from './absen.service';
import { AbsenController } from './absen.controller';
import { WhatsAppModule } from 'src/modules/whatsapp/whatsapp.module';
import { AblyModule } from 'src/ably/ably.module';

@Module({
  imports: [WhatsAppModule, AblyModule],
  providers: [AbsenService],
  controllers: [AbsenController],
})
export class AbsenModule {}
