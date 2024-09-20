import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../entity/product.entity';
import { CreateProductDto } from './dto';
import { CurrentUser } from '../user/dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(
    dto: CreateProductDto,
    user: CurrentUser,
  ): Promise<ProductEntity> {
    const entity = this.productRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      createdBy: user,
    });
    try {
      return await this.productRepository.save(entity);
    } catch (error) {
      throw error;
    }
  }

  async get(page: number, limit: number): Promise<any> {
    const take = limit || 10;
    const skip = page * limit || 0;

    const [orders, total] = await this.productRepository.findAndCount({
      take: take,
      skip: skip,
      relations: ['createdBy'],
    });
    return {
      data: orders,
      total: total,
    };
  }
}
