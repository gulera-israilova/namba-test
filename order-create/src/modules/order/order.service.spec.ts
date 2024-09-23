import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderProductService } from '../order-product/order-product.service';
import { DataSource } from 'typeorm';
import { OrderEntity } from '../../entity/order.entity';
import { KafkaService } from '../kafka/kafka.service';
import { NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepository: any;
  let mockOrderProductService: any;
  let mockKafkaProducer: any;
  let mockDataSource: any;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockOrderProductService = {
      saveOrderProduct: jest.fn(),
      updateOrderProduct: jest.fn(),
    };

    mockKafkaProducer = {
      sendOrderCreatedMessage: jest.fn(),
      sendOrderUpdatedMessage: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn(),
        }),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepository,
        },
        { provide: OrderProductService, useValue: mockOrderProductService },
        { provide: KafkaService, useValue: mockKafkaProducer },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should create a new order and send Kafka message', async () => {
    const mockCreateOrderDto = {
      products: [{ productId: 'product-1', quantity: 1 }],
    };
    const mockUser = { id: 'user-1', name: 'Test User' };

    // Calling the service of order creation
    await service.create(mockCreateOrderDto, mockUser);

    // Check that the methods have been called
    expect(mockOrderRepository.create).toHaveBeenCalled();
    expect(
      mockQueryRunner.manager.getRepository(OrderEntity).save,
    ).toHaveBeenCalled();
    expect(mockOrderProductService.saveOrderProduct).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      mockCreateOrderDto.products,
    );
    expect(mockKafkaProducer.sendOrderCreatedMessage).toHaveBeenCalled();
  });

  it('should rollback transaction on error', async () => {
    const mockCreateOrderDto = {
      products: [{ productId: 'product-1', quantity: 1 }],
    };
    const mockUser = { id: 'user-1', name: 'Test User' };

    // Mock saveOrderProduct to throw an error
    mockOrderProductService.saveOrderProduct.mockRejectedValueOnce(
      new Error('Test Error'),
    );

    // Call the service and check if an error was thrown
    await expect(service.create(mockCreateOrderDto, mockUser)).rejects.toThrow(
      'Test Error',
    );

    // Check that the transaction is rolled back on error
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  describe('get', () => {
    it('should return paginated orders and total count', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          products: [],
          createdBy: { id: 'user-1', name: 'User 1' },
        },
        {
          id: 'order-2',
          products: [],
          createdBy: { id: 'user-2', name: 'User 2' },
        },
      ];
      const mockTotal = 2;

      mockOrderRepository.findAndCount.mockResolvedValueOnce([
        mockOrders,
        mockTotal,
      ]);

      const result = await service.get(1, 10);

      expect(mockOrderRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 10, // page * limit = 1 * 10
        relations: ['products.product', 'createdBy'],
      });

      expect(result).toEqual({
        data: mockOrders,
        total: mockTotal,
      });
    });

    it('should default limit to 10 if no limit is provided', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          products: [],
          createdBy: { id: 'user-1', name: 'User 1' },
        },
      ];
      const mockTotal = 1;

      mockOrderRepository.findAndCount.mockResolvedValueOnce([
        mockOrders,
        mockTotal,
      ]);

      const result = await service.get(0, undefined); // limit не указан

      expect(mockOrderRepository.findAndCount).toHaveBeenCalledWith({
        take: 10, // default limit
        skip: 0,
        relations: ['products.product', 'createdBy'],
      });

      expect(result).toEqual({
        data: mockOrders,
        total: mockTotal,
      });
    });
  });

  describe('getById', () => {
    it('should return an order by ID', async () => {
      const mockOrder = {
        id: 'order-1',
        products: [],
        createdBy: { id: 'user-1', name: 'User 1' },
      };

      mockOrderRepository.findOne.mockResolvedValueOnce(mockOrder);

      const result = await service.getById('order-1');

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        relations: ['products.product', 'createdBy'],
      });

      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing order and send Kafka message', async () => {
      const mockUpdateOrderDto = {
        id: 'order-1',
        products: [{ productId: 'product-1', quantity: 1 }],
      };
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
      };
      const mockOrder = {
        createdAt: '2024-09-20T13:50:57.908Z',
        updatedAt: '2024-09-20T13:50:57.908Z',
        id: 'order-1',
        number: 1,
        status: 'CREATED',
      };

      mockOrderRepository.findOne.mockResolvedValueOnce(mockOrder);
      await service.update(mockUpdateOrderDto, mockUser);

      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(
        mockQueryRunner.manager.getRepository(OrderEntity).save,
      ).toHaveBeenCalled();
      expect(mockKafkaProducer.sendOrderUpdatedMessage).toHaveBeenCalledWith(
        mockOrder.id,
        expect.any(Object),
      );
      expect(mockOrderProductService.updateOrderProduct).toHaveBeenCalledWith(
        expect.any(Object),
        mockOrder.id,
        mockUpdateOrderDto.products,
      );
    });

    it('should throw NotFoundException if order to update not found', async () => {
      const mockUpdateOrderDto = {
        id: 'invalid-id',
        products: [{ productId: 'product-1', quantity: 1 }],
      };
      const mockUser = { id: 'user-1', name: 'Test User' };

      mockOrderRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update(mockUpdateOrderDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rollback transaction on error', async () => {
      const mockUpdateOrderDto = {
        id: 'order-1',
        products: [{ productId: 'product-1', quantity: 1 }],
      };
      const mockUser = { id: 'user-1', name: 'Test User' };
      const mockOrder = {
        id: 'order-1',
        products: [],
        createdBy: { id: 'user-1', name: 'User 1' },
      };

      mockOrderRepository.findOne.mockResolvedValueOnce(mockOrder);
      mockQueryRunner.manager
        .getRepository(OrderEntity)
        .save.mockResolvedValueOnce(mockOrder);
      mockOrderProductService.updateOrderProduct.mockRejectedValueOnce(
        new Error('Test Error'),
      );

      await expect(
        service.update(mockUpdateOrderDto, mockUser),
      ).rejects.toThrow('Test Error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('should delete an existing order', async () => {
      const mockOrderId = 'order-1';
      const mockOrder = {
        id: mockOrderId,
        createdBy: { id: 'user-1', name: 'User 1' },
      };

      mockOrderRepository.findOne.mockResolvedValueOnce(mockOrder);
      mockOrderRepository.remove.mockResolvedValueOnce(undefined);

      const result = await service.deleteById(mockOrderId);

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockOrderId },
      });
      expect(mockOrderRepository.remove).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual({ message: 'Order successfully deleted' });
    });

    it('should throw NotFoundException if order to delete not found', async () => {
      const mockOrderId = 'invalid-id';

      mockOrderRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteById(mockOrderId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockOrderRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw an error if removal fails', async () => {
      const mockOrderId = 'order-1';
      const mockOrder = {
        id: mockOrderId,
        createdBy: { id: 'user-1', name: 'User 1' },
      };

      mockOrderRepository.findOne.mockResolvedValueOnce(mockOrder);
      mockOrderRepository.remove.mockRejectedValueOnce(
        new Error('Removal failed'),
      );

      await expect(service.deleteById(mockOrderId)).rejects.toThrow(
        'Removal failed',
      );
    });
  });
});
