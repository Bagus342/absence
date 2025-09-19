import * as fs from 'fs';
import * as path from 'path';
import { compressImage } from 'src/utils/compress-image.utils';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export class FileUtil {
  static async saveFile(
    buffer: Buffer | ArrayBuffer,
    pathFile: string,
    folder: string,
  ) {
    const subDir = path.join(UPLOAD_DIR, folder);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    const compressed = await compressImage(buffer);
    fs.writeFileSync(`${subDir}/${pathFile}`, compressed);
    return `${subDir}/${pathFile}`;
  }

  static deleteFile(pathFile: string) {
    const split = pathFile.split('/');
    fs.unlinkSync(`${UPLOAD_DIR}/${split[2]}/${split[3]}`);
  }
}
