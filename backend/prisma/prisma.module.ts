import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Global() // Робимо модуль глобальним, щоб не імпортувати його в кожен модуль окремо
@Module({
    providers: [PrismaService, RedisService],
    exports: [PrismaService, RedisService], // Дозволяємо іншим сервісам (наприклад, OrdersService) бачити PrismaService
})
export class PrismaModule { }