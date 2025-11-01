import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { VideosModule } from './videos/videos.module';
import { Video } from './videos/entities/video.entity';
import ormconfig from './ormconfig'; // для реальной БД

// Флаг для включения реальной базы данных
const enableDb = process.env.ENABLE_DB === 'true';

// Конфигурация SQLite in-memory (для локальной разработки или тестов)
const sqliteConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [Video], // обязательно класс сущности с @Entity()
  synchronize: true,
};

@Module({
  imports: [
    // Подключаем БД условно
    ...(enableDb
        ? [TypeOrmModule.forRoot(ormconfig)] // реальная база через ormconfig
        : [TypeOrmModule.forRoot(sqliteConfig)]), // SQLite in-memory

    // Bull (Redis) подключение всегда
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),

    VideosModule,
  ],
})
export class AppModule {}
