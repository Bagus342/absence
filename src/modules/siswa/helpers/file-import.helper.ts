import * as XLSX from 'xlsx';
import * as unzipper from 'unzipper';
import { BadRequestException } from '@nestjs/common';
import { ImportSiswaDto } from '../dto/create-siswa.dto';
import { FileUtil } from 'src/utils/uploadFile.utils';
import { QrService } from 'src/qr/qr.service';

export function parseXlsx(buffer: Buffer): ImportSiswaDto[] {
  try {
    const qrService = new QrService();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: ImportSiswaDto[] = XLSX.utils.sheet_to_json(sheet);
    const result = data.map((val) => {
      const payload = qrService.generatePayload(val.nis);
      return {
        ...val,
        qr_payload: payload,
      };
    });
    return result;
  } catch {
    throw new BadRequestException('Invalid or corrupted XLSX file.');
  }
}

export async function extractImagesFromZip(
  zipBuffer: Buffer,
): Promise<Record<string, string>> {
  const imageMap: Record<string, string> = {};

  try {
    const directory = await unzipper.Open.buffer(zipBuffer);

    for (const file of directory.files) {
      if (file.path.endsWith('/')) continue;

      const fileName = file.path;
      const nameWithoutExt = fileName.split('.')[0];

      const chunks: Buffer[] = [];
      for await (const chunk of file.stream()) {
        chunks.push(chunk as Buffer);
      }

      const buffer = Buffer.concat(chunks);
      const imagePath = await FileUtil.saveFile(buffer, fileName, 'siswa');
      imageMap[nameWithoutExt] = imagePath; // simpan nama file asli
    }

    return imageMap;
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestException(
        'Failed to process ZIP file: ' + error.message,
      );
    }
    throw new BadRequestException('Failed to process ZIP file');
  }
}
