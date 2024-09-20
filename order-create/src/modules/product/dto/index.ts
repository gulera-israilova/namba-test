import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Name', description: 'Product name' })
  @IsString({ message: 'Must be string' })
  name: string;

  @ApiProperty({ example: 'Description', description: 'Product description' })
  @IsString({ message: 'Must be string' })
  description: string;

  @ApiProperty({ example: 100, description: 'Product price' })
  @IsNumber()
  price: number;
}
