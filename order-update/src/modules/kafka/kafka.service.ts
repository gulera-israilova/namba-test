import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/dto';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;

  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 1000; // Задержка между попытками в миллисекундах
  private readonly DLQ_TOPIC = 'dlq-topic'; // DLQ топик

  constructor(private readonly orderService: OrderService) {
    this.kafka = new Kafka({
      clientId: 'order-service-client',
      brokers: ['kafka:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'order-group' });
    this.producer = this.kafka.producer(); // Инициализируем Kafka продюсер для отправки в DLQ
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect(); // Подключаем продюсера
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

        let attempt = 0;
        let success = false;

        while (attempt < this.MAX_RETRIES && !success) {
          try {
            switch (topic) {
              case 'order-created':
                await this.orderService.updateStatus(
                  orderData.id,
                  OrderStatus.CREATED,
                );
                success = true;
                break;

              case 'order-updated':
                await this.orderService.updateStatus(
                  orderData.id,
                  OrderStatus.UPDATED,
                );
                success = true;
                break;

              default:
                Logger.warn(`Unhandled topic: ${topic}`);
                success = true;
                break;
            }
          } catch (error) {
            attempt++;
            Logger.error(
              `Error processing message, attempt ${attempt}/${this.MAX_RETRIES}: ${error.message}`,
            );

            if (attempt >= this.MAX_RETRIES) {
              Logger.error(
                `Failed to process message after ${this.MAX_RETRIES} attempts, sending to DLQ`,
              );
              await this.sendToDLQ(topic, message);
            } else {
              await this.delay(this.RETRY_DELAY);
            }
          }
        }
      },
    });
  }

  // Метод для отправки сообщения в DLQ
  private async sendToDLQ(topic: string, message: any) {
    try {
      await this.producer.send({
        topic: this.DLQ_TOPIC, // Топик DLQ
        messages: [
          {
            key: message.key?.toString() || null, // Ключ сообщения
            value: JSON.stringify({
              originalTopic: topic, // Оригинальный топик
              message: message.value.toString(), // Само сообщение
              partition: message.partition, // Раздел
              offset: message.offset, // Смещение
              timestamp: message.timestamp, // Время
            }),
          },
        ],
      });
      Logger.log(`Message sent to DLQ from topic '${topic}'`);
    } catch (error) {
      Logger.error(`Error sending message to DLQ: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    await this.producer.disconnect(); // Отключаем продюсера
  }

  // Задержка между попытками
  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
