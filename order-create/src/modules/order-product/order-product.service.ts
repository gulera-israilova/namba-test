import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { OrderProductEntity } from '../../entity/order-product.entity';
import { CreateOrderProductDto, UpdateOrderProductDto } from './dto';

@Injectable()
export class OrderProductService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(OrderProductEntity)
    private readonly orderProductRepository: Repository<OrderProductEntity>,
  ) {}

  async saveOrderProduct(
    queryRunner: QueryRunner,
    orderId: string,
    products: CreateOrderProductDto[],
  ): Promise<void> {
    const orderProducts = products.map((item: CreateOrderProductDto) => {
      return queryRunner.manager.getRepository(OrderProductEntity).create({
        order: { id: orderId },
        product: { id: item.productId },
        quantity: item.quantity,
      });
    });

    try {
      await queryRunner.manager
        .getRepository(OrderProductEntity)
        .save(orderProducts);
    } catch (error) {
      throw error;
    }
  }

  async updateOrderProduct(
    queryRunner: QueryRunner,
    orderId: string,
    products: UpdateOrderProductDto[],
  ): Promise<void> {
    try {
      const existingProducts = await queryRunner.manager
        .getRepository(OrderProductEntity)
        .find({
          where: {
            order: { id: orderId },
          },
        });
      await queryRunner.manager
        .getRepository(OrderProductEntity)
        .remove(existingProducts);
      const updatedProducts = products.map((item: UpdateOrderProductDto) => {
        return queryRunner.manager.getRepository(OrderProductEntity).create({
          order: { id: orderId },
          product: { id: item.productId },
          quantity: item.quantity,
        });
      });

      await queryRunner.manager
        .getRepository(OrderProductEntity)
        .save(updatedProducts);
    } catch (error) {
      throw error;
    }
  }
}
