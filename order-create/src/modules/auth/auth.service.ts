import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthDto, AuthResponse, RegisterDto } from './dto';
import { createHash, randomString, verifyHash } from '../../utils/utils';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtTokenService: JwtService,
    private userService: UserService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async register(dto: RegisterDto) {
    const existUser = await this.userService.getByLogin(dto.login);
    if (existUser)
      throw new BadRequestException('User with this login already exists');

    const secret = randomString(10);
    // Hash the password before storing it
    const hashedPassword = createHash(dto.password, secret);

    try {
      await this.userService.create(dto, hashedPassword, secret);
      return {
        message: 'You have successfully registered',
      };
    } catch (error) {
      throw error;
    }
  }

  async login(dto: AuthDto) {
    const user = await this.userService.getByLogin(dto.login);

    if (!user) throw new NotFoundException('Invalid login or password');
    const verified = verifyHash(dto.password, user.key, user.hash);
    if (!verified) throw new BadRequestException('Invalid login or password');

    const payload = {
      id: user.id,
      name: user.name,
    };
    const response: AuthResponse = {
      access_token: this.jwtTokenService.sign(payload),
    };
    return response;
  }
}
