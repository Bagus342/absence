import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PersmissionService } from './permission.service';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { PermissionDto, QueryPermissionDto } from './dto/permission.dto';
import { FileValidationPipe } from '../../common/pipes/file-validation.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Permission } from '@prisma/client';

@Controller('permission')
export class PermissionController {
  constructor(private permissionService: PersmissionService) {}

  @Get()
  getAll(
    @Query() query: QueryPermissionDto,
  ): Promise<PaginatedResponse<Permission>> {
    return this.permissionService.findAll(query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() body: PermissionDto,
  ) {
    return this.permissionService.create(body, file);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  acceptPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: boolean,
  ) {
    return this.permissionService.acceptPermission(id, status);
  }
}
