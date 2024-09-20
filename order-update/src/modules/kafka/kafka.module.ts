import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import {OrderModule} from "../order/order.module";

@Module({
  imports: [OrderModule],
  providers: [KafkaService],
})
export class KafkaModule {}
