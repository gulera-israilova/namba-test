import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/dto';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly orderService: OrderService) {
    this.kafka = new Kafka({
      clientId: 'order-service-client',
      brokers: ['kafka:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'order-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'order-created',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'order-updated',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const orderData = JSON.parse(message.value.toString());

        Logger.log(
          `Received message from topic ${topic}: ${JSON.stringify(orderData)}`,
        );

        switch (topic) {
          case 'order-created':
            await this.orderService.updateStatus(
              orderData.id,
              OrderStatus.CREATED,
            );
            break;

          case 'order-updated':
            await this.orderService.updateStatus(
              orderData.id,
              OrderStatus.UPDATED,
            );
            break;

          default:
            Logger.warn(`Unhandled topic: ${topic}`);
            break;
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
