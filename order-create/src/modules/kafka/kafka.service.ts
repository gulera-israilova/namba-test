import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Admin } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafkaProducer;
  private kafkaAdmin: Admin;

  constructor() {
    const kafka = new Kafka({
      clientId: 'order-service',
      brokers: ['kafka:9092'], // Укажите ваши брокеры Kafka
    });

    this.kafkaProducer = kafka.producer();
    this.kafkaAdmin = kafka.admin(); // Инициализация админа для создания топиков
  }

  async onModuleInit() {
    await this.kafkaProducer.connect();
    await this.kafkaAdmin.connect();
    await this.createTopics(['order-created', 'order-updated']);
  }

  async createTopics(topicNames: string[]) {
    try {
      const existingTopics = await this.kafkaAdmin.listTopics();
      const newTopics = topicNames.filter(
        (topic) => !existingTopics.includes(topic),
      );

      if (newTopics.length > 0) {
        await this.kafkaAdmin.createTopics({
          topics: newTopics.map((topic) => ({
            topic,
            numPartitions: 1, // Опционально, можно указать нужное количество разделов
            replicationFactor: 1, // Опционально, фактор репликации
          })),
        });
        Logger.log(`Topics created: ${newTopics.join(', ')}`);
      } else {
        Logger.log(`All topics already exist: ${topicNames.join(', ')}`);
      }
    } catch (error) {
      Logger.error('Error creating topics:', error);
    }
  }

  async sendOrderCreatedMessage(orderId: string, orderDetails: any) {
    try {
      await this.kafkaProducer.send({
        topic: 'order-created',
        messages: [{ key: orderId, value: JSON.stringify(orderDetails) }],
      });
      Logger.log(`Message sent to topic 'order-created' with key ${orderId}`);
    } catch (error) {
      Logger.error('Error sending message:', error);
    }
  }

  async sendOrderUpdatedMessage(orderId: string, orderDetails: any) {
    try {
      await this.kafkaProducer.send({
        topic: 'order-updated',
        messages: [{ key: orderId, value: JSON.stringify(orderDetails) }],
      });
      Logger.log(`Message sent to topic 'order-updated' with key ${orderId}`);
    } catch (error) {
      Logger.error('Error sending message:', error);
    }
  }
}
