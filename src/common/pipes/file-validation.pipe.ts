import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedMimeType: string[] = [
    'image/jpg',
    'image/jpeg',
    'image/png',
  ];

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image tidak boleh kosong');
    }

    if (!this.allowedMimeType.includes(file.mimetype)) {
      throw new BadRequestException('File harus berupa gambar');
    }

    return file;
  }
}
