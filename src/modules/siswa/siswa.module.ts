import { Module } from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { SiswaController } from './siswa.controller';
import { QrModule } from 'src/qr/qr.module';
import { CardModule } from 'src/card/card.module';

@Module({
  imports: [QrModule, CardModule],
  controllers: [SiswaController],
  providers: [SiswaService],
})
export class SiswaModule {}
