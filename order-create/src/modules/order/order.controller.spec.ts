import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderStatus, UpdateOrderDto } from './dto';
import { BadRequestException } from '@nestjs/common';
import { OrderEntity } from '../../entity/order.entity';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
            get: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            deleteById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  describe('create', () => {
    it('should create an order', async () => {
      const dto: CreateOrderDto = {
        products: [
          {
            productId: 'ae796564-bc9e-4e8e-b41c-b1ce54e8d5c7',
            quantity: 10,
          },
        ],
      };
      const mockUser = { id: 'user-1', name: 'User 1' };

      jest.spyOn(service, 'create').mockResolvedValue({
        message: 'The order has been successfully created',
      });

      const result = await controller.create(dto, mockUser);
      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual({
        message: 'The order has been successfully created',
      });
    });
  });

  describe('get', () => {
    it('should return a list of orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          createdBy: { id: 'user-1', name: 'User 1' },
          products: [{ productId: 'product-1', quantity: 2 }],
          createdAt: new Date('2024-09-20T13:50:57.908Z'),
          updatedAt: new Date('2024-09-22T22:46:43.099Z'),
        },
        {
          id: 'order-2',
          createdBy: { id: 'user-2', name: 'User 2' },
          products: [{ productId: 'product-2', quantity: 1 }],
          createdAt: new Date('2024-09-21T13:50:57.908Z'),
          updatedAt: new Date('2024-09-23T22:46:43.099Z'),
        },
      ];
      jest.spyOn(service, 'get').mockResolvedValue(mockOrders);

      const result = await controller.get(1, 10);
      expect(service.get).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getById', () => {
    it('should return an order by id', async () => {
      const mockOrder = {
        id: 'order-1',
        number: 1,
        status: OrderStatus.CREATED,
        createdBy: {
          id: 'user-1',
          name: 'User 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          surname: 'Surname',
          middleName: 'MiddleName',
          hash: 'hash',
          key: 'key',
          login: 'login',
        },
        products: [
          {
            createdAt: new Date(),
            id: 'b375e624-1062-49a5-a842-c575c55d352e',
            updatedAt: new Date(),
            quantity: 10,
            product: {
              createdAt: new Date(),
              id: 'product-1',
              updatedAt: new Date(),
              name: 'Phone',
              description: 'Phone description',
              price: 1000,
            },
          },
        ],
        createdAt: new Date('2024-09-21T13:50:57.908Z'),
        updatedAt: new Date('2024-09-23T22:46:43.099Z'),
      } as OrderEntity;
      jest.spyOn(service, 'getById').mockResolvedValue(mockOrder);

      const params = { id: 'order-1' };
      const result = await controller.getById(params);

      expect(service.getById).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException if id is not provided', async () => {
      await expect(controller.getById('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const dto: UpdateOrderDto = {
        id: 'order-1',
        products: [{ productId: 'product-1', quantity: 10 }],
      };
      const mockUser = { id: 'user-1', name: 'User 1' };

      jest.spyOn(service, 'update').mockResolvedValue({
        message: 'The order has been successfully updated',
      });

      const result = await controller.update(dto, mockUser);
      expect(service.update).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual({
        message: 'The order has been successfully updated',
      });
    });
  });

  describe('delete', () => {
    it('should delete an order by id', async () => {
      jest
        .spyOn(service, 'deleteById')
        .mockResolvedValue({ message: 'Order successfully deleted' });

      const result = await controller.delete({ id: 'order-1' });
      expect(service.deleteById).toHaveBeenCalledWith('order-1');
      expect(result).toEqual({ message: 'Order successfully deleted' });
    });

    it('should throw BadRequestException if id is empty', async () => {
      await expect(controller.delete({ id: '' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
