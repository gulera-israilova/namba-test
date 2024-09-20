import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT;
  await app.listen(PORT || 4000, () => {
    Logger.log(`Server started on PORT ${PORT}`);
  });
}
bootstrap();
