import { Injectable } from '@nestjs/common';
import { Siswa } from '@prisma/client';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { QrService } from 'src/qr/qr.service';
@Injectable()
export class CardService {
  private readonly templatePath = path.join(
    __dirname,
    'templates',
    'card-template.html',
  );

  constructor(private readonly qrService: QrService) {}

  async generateCard(siswa: Siswa) {
    const qr = await this.qrService.qrGenerate(siswa.qr_payload);

    let htmlTemplate = fs.readFileSync(this.templatePath, 'utf-8');

    htmlTemplate = htmlTemplate
      .replace('{{name}}', siswa.name)
      .replace('{{nis}}', siswa.nis)
      .replace('{{kelas}}', siswa.kelas)
      .replace('{{image}}', `../../${siswa.image}`)
      .replace('{{qr}}', qr as string);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 20,
        y: 20,
        width: 340,
        height: 215,
      },
    });

    await browser.close();

    return imageBuffer;
  }
}
