import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Admin, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafkaProducer: Producer;
  private kafkaAdmin: Admin;

  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 1000;

  constructor() {
    const kafka = new Kafka({
      clientId: 'order-service',
      brokers: ['kafka:9092'],
    });

    this.kafkaProducer = kafka.producer();
    this.kafkaAdmin = kafka.admin();
  }

  async onModuleInit() {
    await this.kafkaProducer.connect();
    await this.kafkaAdmin.connect();
    await this.createTopics(['order-created', 'order-updated', 'dlq-topic']);
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
            numPartitions: 1,
            replicationFactor: 1,
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

  private async sendMessageWithRetry(
    topic: string,
    key: string,
    value: string,
    attempt = 0,
  ) {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{ key, value }],
      });
      Logger.log(`Message sent to topic '${topic}' with key ${key}`);
    } catch (error) {
      Logger.error(
        `Error sending message to topic '${topic}' (attempt ${attempt + 1}): ${error.message}`,
      );

      if (attempt < this.MAX_RETRIES) {
        await this.delay(this.RETRY_DELAY);
        await this.sendMessageWithRetry(topic, key, value, attempt + 1);
      } else {
        Logger.error(
          `Failed to send message after ${this.MAX_RETRIES} attempts. Sending to DLQ...`,
        );
        await this.sendToDLQ(key, value);
      }
    }
  }

  private async sendToDLQ(key: string, value: string) {
    try {
      await this.kafkaProducer.send({
        topic: 'dlq-topic',
        messages: [{ key, value }],
      });
      Logger.log(`Message sent to DLQ with key ${key}`);
    } catch (error) {
      Logger.error(`Error sending message to DLQ: ${error.message}`);
    }
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async sendOrderCreatedMessage(orderId: string, orderDetails: any) {
    await this.sendMessageWithRetry(
      'order-created',
      orderId,
      JSON.stringify(orderDetails),
    );
  }

  async sendOrderUpdatedMessage(orderId: string, orderDetails: any) {
    await this.sendMessageWithRetry(
      'order-updated',
      orderId,
      JSON.stringify(orderDetails),
    );
  }
}
