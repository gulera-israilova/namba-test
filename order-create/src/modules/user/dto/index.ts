import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Test', description: 'Name' })
  @IsString({ message: 'Must be string' })
  name: string;

  @ApiProperty({ example: 'Testov', description: 'Surname' })
  @IsString({ message: 'Must be string' })
  surname: string;

  @ApiProperty({ example: 'Testovich', description: 'MiddleName' })
  @IsString({ message: 'Must be string' })
  middleName: string;

  @ApiProperty({ example: 'test@test.com', description: 'Login' })
  @IsString({ message: 'Must be string' })
  login: string;
}

export class CurrentUser {
  @ApiProperty({ example: 'id', description: 'User id' })
  @IsString({ message: 'Must be string' })
  id: string;

  @ApiProperty({ example: 'username', description: 'User name' })
  @IsString({ message: 'Must be string' })
  name: string;
}
