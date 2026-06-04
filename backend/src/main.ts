import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Увімкнення CORS, щоб наш Next.js (порт 3000) міг вільно викликати API (порт 3001)
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Встановлюємо глобальний префікс версіонування API
  app.setGlobalPrefix('api/v1');

  const port = 3001;
  await app.listen(port);
  Logger.log(`🚀 Сервер SmartResto запущено на: http://localhost:${port}/api/v1`, 'Bootstrap');
}
bootstrap();