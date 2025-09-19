import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AbsenService } from './absen.service';
import { AbsenDto, QueryDto } from './dto/absen.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Absen } from '@prisma/client';

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

  // @Get('/backup')
  // backup() {
  //   return this.absenService.backup();
  // }

  @Post()
  createAbsen(@Body() checkInDto: AbsenDto) {
    return this.absenService.attendace(checkInDto);
  }
}
