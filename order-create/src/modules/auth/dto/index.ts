import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: 'test@test.com', description: 'Login' })
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  readonly login: string;

  @ApiProperty({ example: 'Password', description: 'Password' })
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  readonly password: string;
}
export class AuthResponse {
  @ApiProperty({ example: 'token', description: 'Token' })
  access_token: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Test', description: 'Name' })
  @IsString({ message: 'Must be string' })
  name: string;

  @ApiProperty({ example: 'Testov', description: 'Surname' })
  @IsString({ message: 'Must be string' })
  surname: string;

  @ApiProperty({ example: 'Testovich', description: 'MiddleName' })
  @IsString({ message: 'Must be string' })
  middleName: string;

  @ApiProperty({ example: 'Password', description: 'Password' })
  @IsString({ message: 'Must be string' })
  password: string;

  @ApiProperty({ example: 'test@test.com', description: 'Login' })
  @IsString({ message: 'Must be string' })
  login: string;
}
