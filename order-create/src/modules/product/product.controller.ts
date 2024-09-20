import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto';
import { User } from '../../utils/user.decorator';
import { CurrentUser } from '../user/dto';

@ApiTags('Products')
@Controller({
  path: 'products',
  version: ['1'],
})
export class ProductController {
  constructor(private service: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiBody({ type: CreateProductDto })
  async create(@Body() dto: CreateProductDto, @User() user: CurrentUser) {
    return await this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all products' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Item limit', required: false })
  async get(@Query('page') page: number, @Query('limit') limit: number) {
    return await this.service.get(page, limit);
  }
}
