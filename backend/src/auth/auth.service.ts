import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'prisma/redis.service';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    // Створюємо тестових користувачів при першому старті програми
    async onModuleInit() {
        const count = await this.prisma.user.count();
        if (count === 0) {
            console.log('Початкове створення користувачів персоналу...');
            // В реальних проектах паролі хэшують через bcrypt, але для лаби зробимо просто text,
            // або простий md5/sha256 хэш, щоб не ускладнювати
            await this.prisma.user.createMany({
                data: [
                    { username: 'admin', password: 'adminpassword', role: Role.ADMIN },
                    { username: 'cook1', password: 'cookpassword', role: Role.KITCHEN },
                    { username: 'waiter1', password: 'waiterpassword', role: Role.WAITER },
                ],
            });
            console.log('🤵👨‍🍳🏃‍♂️ Користувачів успішно створено (Паролі в базі)!');
        }
    }

    async login(username: string, password: string) {
        // 1. Шукаємо користувача в PostgreSQL
        const user = await this.prisma.user.findUnique({ where: { username } });

        if (!user || user.password !== password) {
            throw new UnauthorizedException('Невірний логін або пароль');
        }

        // 2. Генеруємо унікальний токен сесії (Secure Random string)
        const token = crypto.randomBytes(32).toString('hex');

        // 3. Записуємо сесію в Redis (NoSQL)
        const sessionData = { username: user.username, role: user.role };
        await this.redis.saveSession(token, sessionData);

        // Повертаємо токен та дані фронтенду
        return {
            token,
            user: sessionData,
        };
    }

    async validateToken(token: string) {
        const session = await this.redis.getSession(token);
        if (!session) {
            throw new UnauthorizedException('Сесія застаріла або недійсна');
        }
        return session;
    }
}