import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWT_CONFIG } from '../../utils/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserEntity } from '../../entity/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register(JWT_CONFIG),
    UserModule,
  ],
  exports: [AuthService, AuthModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
