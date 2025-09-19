import { Module } from '@nestjs/common';
import { UsersController } from 'src/modules/user/user.controller';
import { UserService } from 'src/modules/user/user.service';

@Module({
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
