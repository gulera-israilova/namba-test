import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from '../../entity/order.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { CurrentUser } from '../user/dto';
import { OrderProductService } from '../order-product/order-product.service';
import { v4 as uuidv4 } from 'uuid';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class OrderService {
  constructor(
    private orderProductService: OrderProductService,
    private kafkaProducer: KafkaService,

    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto, user: CurrentUser) {
    const totalOrders = await this.orderRepository.count();
    const newOrderNumber = totalOrders + 1;
    const id = uuidv4();

    const order = this.orderRepository.create({
      id,
      number: newOrderNumber,
      createdBy: user,
    });

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.getRepository(OrderEntity).save(order);
      await this.orderProductService.saveOrderProduct(
        queryRunner,
        id,
        dto.products,
      );
      await queryRunner.commitTransaction();
      await this.kafkaProducer.sendOrderCreatedMessage(id, order);
      return {
        message: 'The order has been successfully created',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async get(page: number, limit: number): Promise<any> {
    const take = limit || 10;
    const skip = page * limit || 0;

    const [orders, total] = await this.orderRepository.findAndCount({
      take: take,
      skip: skip,
      relations: ['products.product', 'createdBy'],
    });
    return {
      data: orders,
      total: total,
    };
  }

  async getById(id: string): Promise<OrderEntity> {
    const item = await this.orderRepository.findOne({
      where: { id },
      relations: ['products.product', 'createdBy'],
    });
    if (!item) throw new NotFoundException();

    return item;
  }

  async update(dto: UpdateOrderDto, user: CurrentUser) {
    const item = await this.orderRepository.findOne({
      where: { id: dto.id },
      relations: ['updatedBy'],
    });
    if (!item) throw new NotFoundException();

    const order = this.orderRepository.create({
      ...item,
      updatedBy: user,
    });

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.getRepository(OrderEntity).save(order);
      await this.kafkaProducer.sendOrderUpdatedMessage(item.id, item);
      await this.orderProductService.updateOrderProduct(
        queryRunner,
        item.id,
        dto.products,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'The order has been successfully updated',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteById(id: string) {
    const item = await this.orderRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    try {
      await this.orderRepository.remove(item);
      return {
        message: 'Order successfully deleted',
      };
    } catch (error) {
      throw error;
    }
  }
}
