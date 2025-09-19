import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { QrModule } from 'src/qr/qr.module';

@Module({
  imports: [QrModule],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
