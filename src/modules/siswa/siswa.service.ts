import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateSiswaDto, ImportSiswaDto } from './dto/create-siswa.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadDto } from './dto/upload.dto';
import { extractImagesFromZip, parseXlsx } from './helpers/file-import.helper';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { FileUtil } from 'src/utils/uploadFile.utils';
import { buildPagination } from '../../utils/build-pagination.utils';
import { QueryDto } from './dto/query.dto';
import { whereBuild } from './helpers/where-builder.helper';
import { PaginationMeta } from 'src/common/interfaces/pagination.interface';
import { QrService } from 'src/qr/qr.service';
import { CardService } from 'src/card/card.service';

@Injectable()
export class SiswaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: QrService,
    private readonly card: CardService,
  ) {}

  async create(file: Express.Multer.File, data: CreateSiswaDto) {
    await this.checkUnique(data.nis);

    let image: string | null = null;
    try {
      image = await FileUtil.saveFile(file.buffer, file.originalname, 'siswa');

      const qr_payload = this.qr.generatePayload(data.nis);

      return this.prisma.siswa.create({
        data: { ...data, image, qr_payload },
      });
    } catch (error) {
      if (image) FileUtil.deleteFile(image);
      throw error;
    }
  }

  async findAll(query: QueryDto) {
    const take = query.limit;
    const skip = (query.page - 1) * take;

    const where = whereBuild(query);
    const total = await this.prisma.siswa.count({ where });
    const pagination: PaginationMeta = buildPagination(query.page, take, total);

    const data = await this.prisma.siswa.findMany({
      where,
      orderBy: { name: 'asc' },
      take,
      skip,
    });

    return { data, pagination };
  }

  async update(
    id: number,
    file: Express.Multer.File,
    updateDto: UpdateSiswaDto,
  ) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id } });

    if (!siswa) {
      throw new BadRequestException('Siswa tidak terdaftar');
    }

    let imagePath: string | null = siswa.image;
    if (file.buffer) {
      FileUtil.deleteFile(siswa.image);
      const image = await FileUtil.saveFile(
        file.buffer,
        file.originalname,
        'siswa',
      );
      imagePath = image;
    }
    return this.prisma.siswa.update({
      where: { id: id },
      data: { ...updateDto, image: imagePath },
    });
  }

  async findOne(id: number) {
    const siswa = await this.prisma.siswa.findUnique({
      where: {
        id,
      },
    });

    if (!siswa) {
      throw new BadRequestException('Siswa tidak ditemukan');
    }

    return siswa;
  }

  async checkUnique(nis: string) {
    const siswa = await this.prisma.siswa.findUnique({
      where: {
        nis,
      },
    });

    if (siswa) {
      throw new ConflictException('Nis telah terdaftar');
    }

    return siswa;
  }

  async createImport(data: ImportSiswaDto[]) {
    return await this.prisma.siswa.createMany({
      data,
    });
  }

  async importFile(files: UploadDto) {
    const xlsxBuffer: Buffer | undefined = files.xlsx[0].buffer;
    const zipBuffer: Buffer | undefined = files.zip[0].buffer;

    try {
      const data: ImportSiswaDto[] = parseXlsx(xlsxBuffer);
      const imageMap = await extractImagesFromZip(zipBuffer);
      const result: ImportSiswaDto[] = data.map((row) => ({
        ...row,
        nis: String(row.nis),
        phone: String(row.phone),
        image: imageMap[row.nis] ? imageMap[row.nis] : '',
      }));
      return await this.createImport(result);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw new BadRequestException('Import failed: ' + error.message);
      }
    }
  }

  async cardDownload(id: number) {
    const siswa = await this.findOne(id);
    return await this.card.generateCard(siswa);
  }

  async remove(id: number) {
    return await this.prisma.siswa.delete({
      where: {
        id,
      },
    });
  }
}
