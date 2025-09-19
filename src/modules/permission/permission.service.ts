import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionDto, QueryPermissionDto } from './dto/permission.dto';
import { FileUtil } from 'src/utils/uploadFile.utils';
import { AblyService } from 'src/ably/ably.service';
import { WhatsappService } from 'src/modules/whatsapp/whatsapp.service';
import { whereBuildPermission } from './helper/where-build';
import { buildPagination } from 'src/utils/build-pagination.utils';

@Injectable()
export class PersmissionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ablyService: AblyService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async findAll(query: QueryPermissionDto) {
    const take = query.limit;
    const skip = (query.page - 1) * take;

    const where = whereBuildPermission(query);
    const total = await this.prismaService.permission.count({ where });

    const pagination = buildPagination(query.page, take, total);
    const data = await this.prismaService.permission.findMany({
      where,
      include: { siswa: true },
      orderBy: [{ nis: 'asc' }, { createdAt: 'desc' }],
      take,
      skip,
    });

    return { data, pagination };
  }

  async findByNis(nis: string) {
    const data = await this.prismaService.siswa.findUnique({
      where: { nis },
    });

    if (!data) {
      throw new BadRequestException('Siswa tidak terdaftar');
    }
    return data;
  }
  async create(permissionDto: PermissionDto, file: Express.Multer.File) {
    await this.findByNis(permissionDto.nis);
    const imagePath = await FileUtil.saveFile(
      file.buffer,
      file.originalname,
      'permission',
    );

    return await this.prismaService.permission.create({
      data: {
        nis: permissionDto.nis,
        keterangan: permissionDto.keterangan,
        image: imagePath,
      },
      include: { siswa: true },
    });
  }

  async acceptPermission(id: number, status: boolean) {
    const data = await this.prismaService.permission.update({
      where: { id },
      data: {
        status,
      },
    });
    const attendance = await this.setAttendancePermission(data.nis);
    await this.ablyService.publish(
      `attendance:${attendance.siswa?.phone}`,
      'permission',
      attendance,
    );
    await this.whatsappService.sendNotification(attendance);
    return data;
  }

  async setAttendancePermission(nis: string) {
    return await this.prismaService.absen.create({
      data: {
        nis: nis,
        status: 'PERMISSION',
        activity: 'Izin',
      },
      include: { siswa: true },
    });
  }
}
