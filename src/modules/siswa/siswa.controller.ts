import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch,
  ParseIntPipe,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nest-lab/fastify-multer';
import { ZodValidationPipe } from 'nestjs-zod';
import { UploadDto } from './dto/upload.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { QueryDto } from './dto/query.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Siswa } from '@prisma/client';

@Controller('siswa')
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() query: QueryDto): Promise<PaginatedResponse<Siswa>> {
    return this.siswaService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() body: CreateSiswaDto,
  ) {
    return this.siswaService.create(file, body);
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'xlsx',
        maxCount: 1,
      },
      {
        name: 'zip',
        maxCount: 1,
      },
    ]),
  )
  uploadFile(
    @UploadedFiles(ZodValidationPipe)
    files: UploadDto,
  ) {
    return this.siswaService.importFile(files);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateSiswaDto,
  ) {
    return this.siswaService.update(id, file, body);
  }

  @Get(':id/image')
  download(@Param('id', ParseIntPipe) id: number) {
    return this.siswaService.cardDownload(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.siswaService.remove(id);
  }
}
