import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async checkUsername(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (user) {
      throw new ConflictException('Username telah ada');
    }

    return true;
  }

  async findOne(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    return user;
  }

  async createUser(data: CreateUserDto): Promise<User | null> {
    await this.checkUsername(data.username);
    const hashedPassword = await bcrypt.hash(data.username, 10);
    return this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
      },
    });
  }
}
