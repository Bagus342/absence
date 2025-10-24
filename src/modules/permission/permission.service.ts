import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionDto, QueryPermissionDto } from './dto/permission.dto';
import { FileUtil } from 'src/utils/file.util';
import { AblyService } from 'src/ably/ably.service';
import { WhatsappService } from 'src/modules/whatsapp/whatsapp.service';
import { whereBuildPermission } from './helper/where-build';
import { buildPagination } from 'src/utils/pagination.util';
import { Permission, StatusAbsen, StatusPermission } from '@prisma/client';

@Injectable()
export class PermissionService {
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

  async createPermission(
    permissionDto: PermissionDto,
    file: Express.Multer.File,
  ) {
    await this.findByNis(permissionDto.nis);
    const imagePath = await FileUtil.saveFile(
      file.buffer,
      file.originalname,
      'permission',
    );

    const absenId = (await this.setAttendancePermission(permissionDto)).id;

    return await this.prismaService.permission.create({
      data: {
        absenId,
        nis: permissionDto.nis,
        keterangan: permissionDto.keterangan,
        status: StatusPermission.WAITING,
        image: imagePath,
      },
      include: { siswa: true },
    });
  }

  async acceptPermission(id: number, status: StatusPermission) {
    const data = await this.prismaService.permission.update({
      where: { id },
      data: {
        status,
      },
      include: { absen: true },
    });
    const attendance = await this.setAttendancePermission(data);
    await this.ablyService.publish(
      `attendance:${attendance.siswa?.phone}`,
      status === StatusPermission.APPROVE ? 'permission' : 'alpha',
      attendance,
    );
    await this.whatsappService.sendNotification(attendance);
    return data;
  }

  async setAttendancePermission(data: Permission | PermissionDto) {
    if (data instanceof PermissionDto) {
      return await this.prismaService.absen.create({
        data: {
          nis: data.nis,
          status: StatusAbsen.PERMISSION,
          activity: 'Izin',
        },
        include: { siswa: true },
      });
    }
    return await this.prismaService.absen.update({
      where: { id: data.absenId },
      data: {
        nis: data.nis,
        status:
          data.status === StatusPermission.APPROVE && StatusPermission.WAITING
            ? StatusAbsen.PERMISSION
            : null,
        activity:
          data.status === StatusPermission.APPROVE && StatusPermission.WAITING
            ? 'Izin'
            : 'Alpha',
      },
      include: { siswa: true },
    });
  }
}
