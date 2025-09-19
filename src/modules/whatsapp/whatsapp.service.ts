import {
  BadRequestException,
  Injectable,
  MessageEvent,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AbsenWithPrisma } from 'src/modules/absen/dto/absen.dto';
import {
  QrCodeResponse,
  ResponseSession,
  SessionStatus,
  WebhookRequest,
} from './whatsapp.interface';
import { map, Subject } from 'rxjs';

@Injectable()
export class WhatsappService implements OnApplicationBootstrap {
  private readonly url = process.env.WHATSAPP_URL;
  private sessionEvents$ = new Subject<MessageEvent>();

  constructor(private readonly httpService: HttpService) {}

  async onApplicationBootstrap() {
    const status = await this.getSession();
    if (status.status === SessionStatus.STOPPED) {
      await this.httpService.axiosRef.post(
        `${this.url}/api/sessions/default/start`,
        {},
      );
    }
  }

  getSessionStream() {
    return this.sessionEvents$.asObservable().pipe(map((data) => ({ data })));
  }

  updateSessionStream(data: MessageEvent) {
    this.sessionEvents$.next(data);
  }

  async handleWebhook(body: WebhookRequest) {
    const message: MessageEvent = {
      data: body.payload.status,
    };

    if (message.data == SessionStatus.FAILED) {
      await this.restartSession();
    }

    this.updateSessionStream(message);
  }

  async getSession() {
    const response = await this.httpService.axiosRef.get(
      `${this.url}/api/sessions/default`,
    );

    const data = response.data as ResponseSession;

    return data;
  }

  async restartSession() {
    await this.httpService.axiosRef.post(
      `${this.url}/api/sessions/default/restart`,
    );
  }
  async getQr() {
    const session = await this.getSession();
    if (session.status === SessionStatus.WORKING) {
      throw new BadRequestException('Whatsapp anda telah terpasang');
    }
    const response = await this.httpService.axiosRef.get(
      `${this.url}/api/default/auth/qr?format=image`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const data = response.data as QrCodeResponse;
    return data;
  }

  async sendNotification(absen: AbsenWithPrisma) {
    await this.httpService.axiosRef.post(`${this.url}/api/sendText`, {
      chatId: `62${absen.siswa.phone}@c.us`,
      text: `*NOTIFIKASI ABSEN*\n \n Nama : ${absen.siswa.name} \n ${absen.status == 'PERMISSION' ? 'Izin' : 'Kehadiran'} : ${absen.activity} \n ${absen.status == 'PERMISSION' ? '' : 'Status :'} ${absen.status == 'ONTIME' ? 'Tepat waktu' : absen.status == 'PERMISSION' ? '' : 'Terlambat'} \n ${absen.createdAt.toLocaleDateString()}`,
      session: 'default',
    });
  }
}
