import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { WhatsappService } from 'src/modules/whatsapp/whatsapp.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private whatsAppService: WhatsappService,
  ) {}

  async signIn(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(username);
    const passwordMatch: boolean = await bcrypt.compare(
      password,
      user?.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
