import { Body, Controller, Get, Post, Sse, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WhatsappService } from './whatsapp.service';
import type { WebhookRequest } from './whatsapp.interface';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: WebhookRequest) {
    console.log(body.payload);
    await this.whatsappService.handleWebhook(body);
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get()
  getSession() {
    return this.whatsappService.getSession();
  }

  @Sse('stream')
  stream() {
    return this.whatsappService.getSessionStream();
  }

  @UseGuards(AuthGuard)
  @Get('qr')
  qrCode() {
    return this.whatsappService.getQr();
  }
}
