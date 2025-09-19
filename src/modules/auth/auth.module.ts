import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { WhatsAppModule } from 'src/modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    UserModule,
    WhatsAppModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
