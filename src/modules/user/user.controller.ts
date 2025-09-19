import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { CreateUserDto } from './dto/user.dto';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async users() {
    return this.userService.findAll();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User | null> {
    return this.userService.createUser(createUserDto);
  }
}
