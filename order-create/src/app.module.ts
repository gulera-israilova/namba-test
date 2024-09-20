import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { dataSourceOptions } from '../data-source';
import { entities } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './utils/auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { OrderProductModule } from './modules/order-product/order-product.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature(entities),
    AuthModule,
    ProductModule,
    OrderModule,
    OrderProductModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'orders/:id', method: RequestMethod.GET },
      )
      .forRoutes({ path: '/*', method: RequestMethod.ALL });
  }
}
