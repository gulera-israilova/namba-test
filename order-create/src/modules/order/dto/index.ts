import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import {
  CreateOrderProductDto,
  UpdateOrderProductDto,
} from '../../order-product/dto';

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderProductDto] })
  products: CreateOrderProductDto[];
}

export class UpdateOrderDto {
  @ApiProperty({ description: 'Order id' })
  @IsUUID()
  id: string;

  @ApiProperty({ type: [UpdateOrderProductDto] })
  products: UpdateOrderProductDto[];
}

export enum OrderStatus {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
}
