import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart'; // ✅ импортируем
import * as fs from 'fs';

async function bootstrap() {
  if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

  const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
  );

  // ✅ Обязательно подключаем поддержку multipart
  await app.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1 ГБ (можно поставить меньше, например 200MB)
      files: 1, // не более одного файла за раз
    },
  });

  app.enableCors(); // для React

  await app.listen(3000, '0.0.0.0');
  console.log('🚀 Fastify backend запущен на http://localhost:3000');
}

bootstrap();
