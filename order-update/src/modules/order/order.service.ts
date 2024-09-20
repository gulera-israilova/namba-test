import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../entity/order.entity';
import { OrderStatus } from './dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async updateStatus(orderId: string, status: OrderStatus) {
    const item = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!item) {
      throw new Error('Order not found');
    }
    item.status = status;
    try {
      await this.orderRepository.save(item);
    } catch (error) {
      throw error;
    }
  }
}
