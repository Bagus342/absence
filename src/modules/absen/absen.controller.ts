import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { AbsenService } from './absen.service';
import { AbsenDto, ArchiveDto, QueryDto } from './dto/absen.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Absen } from '@prisma/client';
import type { FastifyReply } from 'fastify';

@Controller('attendance')
export class AbsenController {
  constructor(private absenService: AbsenService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAll(@Query() query: QueryDto): Promise<PaginatedResponse<Absen>> {
    return this.absenService.findAll(query);
  }

  @Get(':phone')
  async getAbsenByPhone(@Param('phone') phone: string) {
    const data = await this.absenService.findByPhone(phone);
    return { data: data };
  }

  @UseGuards(AuthGuard)
  @Post('/archive')
  async archiveXlsx(@Body() body: ArchiveDto, @Res() res: FastifyReply) {
    const buffer = await this.absenService.archiveXlsxAttendance(body.month);
    res.header(
      'content-disposition',
      `attachment; filename: archive-${buffer.month}`,
    );
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer.buffer);
  }

  @Get('/pdf')
  archivePdf(@Body() body: ArchiveDto) {
    return this.absenService.archivePdfAttendance(body.month);
  }

  @UseGuards(AuthGuard)
  @Get('/backup')
  async backup(@Res() res: FastifyReply) {
    const buffer = await this.absenService.backupAttendance();
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Sse('statistic')
  async statisticStream() {
    return this.absenService.statistic();
  }

  @Post()
  createAbsen(@Body() checkInDto: AbsenDto) {
    return this.absenService.attendace(checkInDto);
  }
}
