import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../data-source';
import { entities } from './entities';
import {KafkaModule} from "./modules/kafka/kafka.module";
import {OrderModule} from "./modules/order/order.module";

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature(entities),
      KafkaModule,
      OrderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
