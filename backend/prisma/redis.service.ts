import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client!: Redis;

    async onModuleInit() {
        // Ініціалізуємо підключення до Redis
        this.client = new Redis({
            host: 'localhost',
            port: 6379,
        });
        console.log('✔ Підключено до Redis сховища сесій!');
    }

    // Записати токен сесії (TTL 7200 секунд = 2 години)
    async saveSession(token: string, userData: { username: string; role: string }, ttlSeconds: number = 7200): Promise<void> {
        await this.client.set(token, JSON.stringify(userData), 'EX', ttlSeconds);
    }

    // Отримати дані сесії за токеном
    async getSession(token: string): Promise<{ username: string; role: string } | null> {
        const data = await this.client.get(token);
        if (!data) return null;
        return JSON.parse(data);
    }

    // Видалити сесію (Logout)
    async destroySession(token: string): Promise<void> {
        await this.client.del(token);
    }

    async onModuleDestroy() {
        this.client.disconnect();
    }
}