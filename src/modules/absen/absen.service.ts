import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AblyService } from 'src/ably/ably.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AbsenDto, AbsenWithPrisma, QueryDto } from './dto/absen.dto';
import { DateTime } from 'luxon';
import { WhatsappService } from 'src/modules/whatsapp/whatsapp.service';
import { whereBuildAbsen } from './helper/where-build.helper';
import { buildPagination } from 'src/utils/build-pagination.utils';

@Injectable()
export class AbsenService {
  private dateTimeNow: DateTime = DateTime.now().setZone('Asia/Jakarta');

  constructor(
    private readonly prismaService: PrismaService,
    private readonly ablyService: AblyService,
    private readonly whatsAppService: WhatsappService,
  ) {}

  async findAll(query: QueryDto) {
    const take = query.limit;
    const skip = (query.page - 1) * take;

    const where = whereBuildAbsen(query);
    const total = await this.prismaService.absen.count({ where });
    const pagination = buildPagination(query.page, take, total);

    const data = await this.prismaService.absen.findMany({
      where,
      include: { siswa: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return { data, pagination };
  }

  async findByPhone(phone: string) {
    const siswa = await this.prismaService.siswa.findFirst({
      where: { phone },
    });

    if (!siswa) {
      throw new NotFoundException('Nomor Telepon tidak terdaftar');
    }

    return this.prismaService.absen.findMany({ where: { nis: siswa.nis } });
  }

  async findByNis(nis: string) {
    const siswa = await this.prismaService.siswa.findUnique({
      where: {
        nis,
      },
    });

    if (!siswa) {
      throw new BadRequestException('Siswa tidak terdaftar');
    }

    return siswa;
  }

  async checkLibur() {
    const now = this.dateTimeNow.toLocal().toJSDate();
    const data = await this.prismaService.libur.findFirst({
      where: { tanggal: now },
    });

    if (data) {
      throw new BadRequestException('Hari ini libur');
    }
  }

  async findCheckIn(absen: AbsenDto) {
    const startOfDay = this.dateTimeNow.startOf('day').toJSDate();
    const endOfDay = this.dateTimeNow.endOf('day').toJSDate();

    const latest = await this.prismaService.absen.findFirst({
      where: {
        nis: absen.nis,
        activity: 'masuk',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      throw new BadRequestException('Siswa telah absen masuk');
    }
  }

  async checkInStatus(absen: AbsenDto) {
    const hour = this.dateTimeNow.hour;
    const minute = this.dateTimeNow.minute;

    absen.status = 'ONTIME';
    absen.activity = 'Masuk';

    if ((hour >= 7 && minute >= 15) || hour > 7) {
      absen.status = 'LATE';
      const data: AbsenWithPrisma = await this.createAbsen(absen);
      await this.ablyService.publish(
        `attendance:${data.siswa?.phone}`,
        'checkIn',
        data,
      );
    }
    const data: AbsenWithPrisma = await this.createAbsen(absen);
    await this.ablyService.publish(
      `attendance:${data.siswa?.phone}`,
      'checkIn',
      data,
    );
    return data;
  }

  async findCheckOut(absen: AbsenDto) {
    const startOfDay = this.dateTimeNow.startOf('day').toJSDate();
    const endOfDay = this.dateTimeNow.endOf('day').toJSDate();

    const latest = await this.prismaService.absen.findFirst({
      where: {
        nis: absen.nis,
        activity: 'pulang',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { siswa: true },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      throw new BadRequestException('Siswa telah absen pulang');
    }
  }

  async checkOutStatus(absen: AbsenDto) {
    const hour = this.dateTimeNow.hour;
    const minute = this.dateTimeNow.minute;

    absen.status = 'ONTIME';
    absen.activity = 'Pulang';

    if ((hour >= 15 && minute >= 15) || hour > 15) {
      absen.status = 'LATE';
      const data: AbsenWithPrisma = await this.createAbsen(absen);
      await this.ablyService.publish(
        `attendance:${data.siswa?.phone}`,
        'checkOut',
        data,
      );
      return data;
    }
    const data: AbsenWithPrisma = await this.createAbsen(absen);
    await this.ablyService.publish(
      `attendance:${data.siswa?.phone}`,
      'checkOut',
      data,
    );
    return data;
  }

  async createAbsen(absen: AbsenDto) {
    return await this.prismaService.absen.create({
      data: absen,
      include: { siswa: true },
    });
  }

  async attendace(checkInDto: AbsenDto) {
    await this.findByNis(checkInDto.nis);
    await this.checkLibur();
    const hour = this.dateTimeNow.hour;

    if (hour < 7) {
      throw new BadRequestException('Harap melakukan absen pada jam 7');
    }

    if (hour > 15) {
      await this.findCheckOut(checkInDto);
      const data = await this.checkOutStatus(checkInDto);
      await this.whatsAppService.sendNotification(data);
      return data;
    }

    await this.findCheckIn(checkInDto);
    const data = await this.checkInStatus(checkInDto);
    await this.whatsAppService.sendNotification(data);
    return data;
  }

  // async backup() {
  //   const now = this.dateTimeNow.startOf('month').toJSDate();
  //   console.log(now);
  // return await this.prismaService.absen.findMany({
  //   where: {
  //     createdAt: { lte: now },
  //   },
  // });
  // }
}
