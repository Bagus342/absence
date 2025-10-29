import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSiswaDto, ImportSiswaDto } from './dto/create-siswa.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadDto } from './dto/upload.dto';
import { extractImagesFromZip, parseXlsx } from './helpers/file-import.helper';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { FileUtil } from 'src/utils/file.util';
import { buildPagination } from '../../utils/pagination.util';
import { QueryDto } from './dto/query.dto';
import { whereBuild } from './helpers/where-builder.helper';
import { PaginationMeta } from 'src/common/interfaces/pagination.interface';
import { QrService } from 'src/qr/qr.service';
import { CardService } from 'src/card/card.service';
import { archiveHelper } from './helpers/archive.helper';

@Injectable()
export class SiswaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: QrService,
    private readonly card: CardService,
  ) {}

  async create(file: Express.Multer.File, data: CreateSiswaDto) {
    const nis = await this.checkNis(data.nis);
    const rfid = await this.checkRfid(data.rfid);

    if (nis) {
      throw new BadRequestException('Nis telah terdaftar');
    }

    if (rfid) {
      throw new BadRequestException('Rfid telah terdaftar');
    }

    let image: string | null = null;
    try {
      image = await FileUtil.saveFile(file.buffer, file.originalname, 'siswa');

      const qr_payload = this.qr.generatePayload(data.nis);

      return this.prisma.siswa.create({
        data: { ...data, image, qr_payload },
      });
    } catch (error) {
      if (image) await FileUtil.deleteFile(image);
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

    const nis = await this.checkNis(updateDto.nis!);
    const rfid = await this.checkRfid(updateDto.rfid!);

    if (nis && nis.id !== id) {
      throw new ConflictException('Nis telah terdaftar');
    }

    if (rfid && rfid.id !== id) {
      throw new ConflictException('Rfid telah terdaftar');
    }

    let imagePath: string | null = siswa.image;
    if (file.buffer) {
      await FileUtil.deleteFile(siswa.image);
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

  async checkRfid(rfid: string) {
    const siswa = await this.prisma.siswa.findUnique({
      where: {
        rfid,
      },
    });

    return siswa;
  }

  async checkNis(nis: string) {
    const siswa = await this.prisma.siswa.findUnique({
      where: {
        nis,
      },
    });

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
        rfid: String(row.rfid),
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

  async archiveSiswa(kelas: string) {
    const data = await this.prisma.siswa.findMany({
      where: { kelas },
    });

    if (data.length === 0) {
      throw new NotFoundException(`Tidak ada siswa kelas ${kelas}`);
    }

    await this.prisma.siswa.deleteMany({ where: { kelas } });

    for (const v of data) {
      await FileUtil.deleteFile(v.image);
    }

    return archiveHelper(
      `Arsip Kelas ${kelas}`,
      ['NIS', 'Rfid', 'Name', 'Kelas', 'Nomor Telepon', 'Wali'],
      data,
    );
  }

  async cardDownload(id: number) {
    const siswa = await this.findOne(id);
    return await this.card.generateCard(siswa);
  }

  async remove(id: number) {
    const path = await this.findOne(id);
    await FileUtil.deleteFile(path.image);
    return await this.prisma.siswa.delete({
      where: {
        id,
      },
    });
  }
}
