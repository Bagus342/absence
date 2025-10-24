import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { CommonModule } from 'src/common/common.module';
import { WhatsAppModule } from 'src/modules/whatsapp/whatsapp.module';
import { AblyModule } from 'src/ably/ably.module';

@Module({
  imports: [CommonModule, WhatsAppModule, AblyModule],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
