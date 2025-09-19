import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qrCode from 'qrcode';
@Injectable()
export class QrService {
  private readonly SERVER_SECRET = process.env.SERVER_SECRET ?? '';
  private readonly SALT = process.env.SALT;

  generatePayload(nis: string): string {
    const data = nis + this.SALT;

    const hash = crypto
      .createHmac('sha256', this.SERVER_SECRET)
      .update(data)
      .digest('hex')
      .substring(0, 16);

    return `${nis}:${hash}`;
  }

  async qrGenerate(data: string | null) {
    try {
      if (!data) throw new InternalServerErrorException();
      return await qrCode.toDataURL(data);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  }
}
