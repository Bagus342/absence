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
    await fs.promises.writeFile(`${subDir}/${pathFile}`, compressed);
    return `${subDir}/${pathFile}`;
  }

  static async deleteFile(pathFile: string) {
    const split = pathFile.split('/');
    await fs.promises.unlink(`${UPLOAD_DIR}/${split[2]}/${split[3]}`);
  }
}
