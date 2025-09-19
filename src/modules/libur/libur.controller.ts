import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { LiburDto } from './dto/libur.dto';
import { LiburService } from './libur.service';

@Controller('libur')
export class LiburController {
  constructor(private liburService: LiburService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.liburService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: LiburDto) {
    return this.liburService.create(body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.liburService.delete(id);
  }
}
