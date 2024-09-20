import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entity/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getByLogin(login: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { login: ILike(login) },
    });
  }

  async create(dto: CreateUserDto, hashedPassword: string, secret: string) {
    const entity = this.userRepository.create({
      name: dto.name,
      surname: dto.surname,
      middleName: dto.middleName,
      hash: hashedPassword,
      key: secret,
      login: dto.login,
    });
    await this.userRepository.save(entity);
  }
}
