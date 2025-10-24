import {
  BadRequestException,
  Injectable,
  NotFoundException,
  MessageEvent,
} from '@nestjs/common';
import { AblyService } from 'src/ably/ably.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AbsenDto, AbsenWithPrisma, QueryDto } from './dto/absen.dto';
import { DateTime } from 'luxon';
import { WhatsappService } from 'src/modules/whatsapp/whatsapp.service';
import { whereBuildAbsen } from './helper/where-build.helper';
import { buildPagination } from 'src/utils/pagination.util';
import { ArchiveUtil } from 'src/utils/archive.util';
import { Cron } from '@nestjs/schedule';
import { StatusAbsen } from '@prisma/client';
import { map, Subject } from 'rxjs';

@Injectable()
export class AbsenService {
  private dateTimeNow: DateTime = DateTime.now().setZone('Asia/Jakarta');
  private sessionEvents$ = new Subject<MessageEvent>();

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
    const gte = this.dateTimeNow.startOf('day').toJSDate();
    const lte = this.dateTimeNow.endOf('day').toJSDate();

    const latest = await this.prismaService.absen.findFirst({
      where: {
        nis: absen.nis,
        activity: 'Masuk',
        createdAt: { gte, lte },
      },
      include: { siswa: true },
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
    const gte = this.dateTimeNow.startOf('day').toJSDate();
    const lte = this.dateTimeNow.endOf('day').toJSDate();

    const latest = await this.prismaService.absen.findFirst({
      where: {
        nis: absen.nis,
        activity: 'Pulang',
        createdAt: { gte, lte },
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

  async archiveXlsxAttendance(month: number) {
    const gte = new Date(this.dateTimeNow.year, month, 1);
    const lte = new Date(this.dateTimeNow.year, month + 1, 1);

    const data = await this.prismaService.absen.findMany({
      where: { createdAt: { gte, lte } },
      include: { siswa: true },
    });

    if (data.length === 0) {
      throw new BadRequestException(
        `Tidak ada data pada bulan ${gte.toLocaleString('default', { month: 'long' })}`,
      );
    }

    const rows = data.map((v) => [
      v.nis,
      v.siswa.name,
      v.activity,
      v.status,
      v.createdAt.toLocaleDateString(),
    ]);

    const buffer = ArchiveUtil.generateXlsxFile(
      `Absen-bulan-${lte.toLocaleString('default', { month: 'long' })}`,
      ['NIS', 'Nama', 'Aktifitas', 'Status', 'Tanggal'],
      rows,
    );

    return { month: lte.toLocaleString('default', { month: 'long' }), buffer };
  }

  async archivePdfAttendance(month: number) {
    const gte = new Date(this.dateTimeNow.year, month, 1);
    const lte = new Date(this.dateTimeNow.year, month + 1, 1);
    return await this.prismaService.absen.findMany({
      where: { createdAt: { gte, lte } },
      include: { siswa: true },
    });
  }

  async backupAttendance() {
    const gte = this.dateTimeNow.startOf('year').minus({ year: 1 }).toJSDate();
    const lte = this.dateTimeNow.endOf('year').minus({ year: 1 }).toJSDate();
    const data = await this.prismaService.absen.findMany({
      include: { siswa: true },
      where: {
        createdAt: { gte, lte },
      },
    });

    if (data.length == 0) {
      throw new BadRequestException('Tidak ada data absen tahun kemarin');
    }

    await this.prismaService.absen.deleteMany({
      where: {
        createdAt: { gte, lte },
      },
    });

    const rows = data.map((v) => [
      v.nis,
      v.siswa.name,
      v.activity,
      v.status,
      v.createdAt.toLocaleDateString(),
    ]);

    const buffer = ArchiveUtil.generateXlsxFile(
      `Absen-bulan-${lte.toLocaleString('default', { month: 'long' })}`,
      ['NIS', 'Nama', 'Aktifitas', 'Status', 'Tanggal'],
      rows,
    );

    return buffer;
  }

  @Cron('0 31 7-8 * * *')
  async setAlpha() {
    const gte = this.dateTimeNow.startOf('day').toJSDate();
    const lte = this.dateTimeNow.endOf('day').toJSDate();
    const students = await this.prismaService.siswa.findMany();
    const attendances = await this.prismaService.absen.findMany({
      where: {
        AND: [
          { createdAt: { gte, lte } },
          { OR: [{ activity: 'Masuk' }, { activity: 'Izin' }] },
        ],
      },
      select: { nis: true },
    });

    const attendance = new Set(attendances.map((v) => v.nis));

    const alphaStudent = students.filter((v) => !attendance.has(v.nis));

    const results = await this.prismaService.absen.createManyAndReturn({
      data: alphaStudent.map((s) => ({
        nis: s.nis,
        activity: 'Alpha',
      })),
      include: { siswa: true },
      skipDuplicates: true,
    });

    await Promise.all(
      results.map(async (v) => {
        await this.ablyService.publish(`attendance:${v.siswa.phone}`, 'alpha', {
          v,
        });
      }),
    );
  }

  async statistic() {
    const gte = this.dateTimeNow.startOf('day').toJSDate();
    const lte = this.dateTimeNow.endOf('day').toJSDate();
    const onTime = await this.prismaService.absen.count({
      where: {
        AND: [
          { activity: 'Masuk' },
          { status: StatusAbsen.ONTIME },
          { createdAt: { gte, lte } },
        ],
      },
    });
    const late = await this.prismaService.absen.count({
      where: {
        AND: [
          { activity: 'Masuk' },
          { status: StatusAbsen.LATE },
          { createdAt: { gte, lte } },
        ],
      },
    });
    const notPresent = await this.prismaService.absen.count({
      where: {
        AND: [{ activity: 'Izin' }, { createdAt: { gte, lte } }],
        OR: [{ activity: 'Alpha' }],
      },
    });
    return { onTime, late, notPresent };
  }

  handleStreamStatistic(
    onTime: number | null,
    late: number | null,
    alpha: number | null,
  ) {
    let totalOnTime = 0;
    let totalLate = 0;
    let totalAlpha = 0;

    if (onTime) {
      totalOnTime++;
    }

    if (late) {
      totalLate++;
    }

    if (alpha) {
      totalAlpha++;
    }

    return { data: { totalOnTime, totalLate, totalAlpha } } as MessageEvent;
  }

  getStatisticStream() {
    return this.sessionEvents$.asObservable().pipe(map((data) => ({ data })));
  }

  updateStatisticStream(data: MessageEvent) {
    this.sessionEvents$.next(data);
  }
}
