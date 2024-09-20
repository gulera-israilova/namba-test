import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderProductDto {
  @ApiProperty({ example: 'ae796564-bc9e-4e8e-b41c-b1ce54e8d5c7', description: 'Product id' })
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10, description: 'Product quantity' })
  @IsNumber()
  quantity: number;
}

export class UpdateOrderProductDto {
  @ApiProperty({ example: 'id', description: 'Product id' })
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10, description: 'Product quantity' })
  @IsNumber()
  quantity: number;
}
