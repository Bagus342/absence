import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LiburDto } from './dto/libur.dto';

@Injectable()
export class LiburService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.libur.findMany();
  }

  async findByDate(date: Date) {
    const data = await this.prisma.libur.findFirst({
      where: { tanggal: date },
    });
    if (data) {
      throw new BadRequestException('Tanggal sudah terdaftar');
    }
  }

  async create(data: LiburDto) {
    await this.findByDate(data.tanggal);
    return await this.prisma.libur.create({ data });
  }

  async delete(id: number) {
    const check = await this.prisma.libur.findUnique({ where: { id } });

    if (!check) throw new BadRequestException('Data tidak terdaftar');

    return await this.prisma.libur.delete({ where: { id } });
  }
}
