import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { User } from '../../utils/user.decorator';
import { CurrentUser } from '../user/dto';
import { CreateOrderDto, UpdateOrderDto } from './dto';

@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: ['1'],
})
export class OrderController {
  constructor(private service: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order' })
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() dto: CreateOrderDto, @User() user: CurrentUser) {
    return await this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all orders' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Item limit', required: false })
  async get(@Query('page') page: number, @Query('limit') limit: number) {
    return await this.service.get(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiParam({ name: 'id', description: 'Order id' })
  async getById(@Param() params) {
    if (!params.id) throw new BadRequestException('Empty param: id');

    return await this.service.getById(params.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update order by id' })
  @ApiBody({ type: UpdateOrderDto })
  async update(@Body() dto: UpdateOrderDto, @User() user: CurrentUser) {
    return await this.service.update(dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by id' })
  @ApiParam({ name: 'id', description: 'Order id' })
  async delete(@Param() params) {
    if (!params.id) throw new BadRequestException('Empty param: id');

    return await this.service.deleteById(params.id);
  }
}
