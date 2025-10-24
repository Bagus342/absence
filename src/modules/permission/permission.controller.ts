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
import { PermissionService } from './permission.service';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { PermissionDto, QueryPermissionDto } from './dto/permission.dto';
import { FileValidationPipe } from '../../common/pipes/file-validation.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Permission, StatusPermission } from '@prisma/client';

@Controller('permission')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

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
    return this.permissionService.createPermission(body, file);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  acceptPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: StatusPermission,
  ) {
    return this.permissionService.acceptPermission(id, status);
  }
}
