import { Module } from '@nestjs/common';
import { LiburService } from './libur.service';
import { LiburController } from './libur.controller';

@Module({
  providers: [LiburService],
  controllers: [LiburController],
})
export class LiburModule {}
