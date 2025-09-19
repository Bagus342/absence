import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'admin',
        },
      }),
    }),
  ],
  providers: [WhatsappService],
  controllers: [WhatsAppController],
  exports: [WhatsappService],
})
export class WhatsAppModule {}
