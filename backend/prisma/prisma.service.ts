import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Role, TableStatus } from '@prisma/client';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Koli4k@@@@localhost:5432/smartresto?schema=public";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;

    constructor() {
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        // Передаємо адаптер у конструктор Prisma 7
        super({ adapter });
        this.pool = pool;
    }

    async onModuleInit() {
        await this.$connect();
        console.log('✔ Успішно підключено до PostgreSQL через Driver Adapter!');

        // 2. Одразу після підключення робимо автоматичний Seeding персоналу
        try {
            const count = await this.user.count();
            if (count === 0) {
                console.log('🚀 База даних пуста. Починаємо створення користувачів персоналу...');
                await this.user.createMany({
                    data: [
                        { username: 'admin', password: 'adminpassword', role: Role.ADMIN },
                        { username: 'cook1', password: 'cookpassword', role: Role.KITCHEN },
                        { username: 'waiter1', password: 'waiterpassword', role: Role.WAITER },
                    ],
                });
                console.log('🤵👨‍🍳🏃‍♂️ Користувачів успішно створено безпосередньо через PrismaService!');
            } else {
                console.log(`📊 У базі вже є користувачі (${count} чол.). Пропускаємо створення.`);
            }
        } catch (error) {
            console.error('❌ Помилка під час автоматичного створення користувачів:', error);
        }
        try {
            const tableCount = await this.table.count();
            if (tableCount === 0) {
                console.log('🚀 Зал пустий. Створюємо перші столи для SmartResto...');
                await this.table.createMany({
                    data: [
                        { number: 1, capacity: 2, status: TableStatus.FREE },
                        { number: 2, capacity: 4, status: TableStatus.OCCUPIED },
                        { number: 3, capacity: 4, status: TableStatus.DIRTY },
                        { number: 4, capacity: 6, status: TableStatus.FREE },
                        { number: 5, capacity: 2, status: TableStatus.OCCUPIED },
                    ],
                });
                console.log('🪑 Початкові столи успішно згенеровано в PostgreSQL!');
            }
        } catch (error) {
            console.error('❌ Помилка під час автоматичного створення столів:', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
    }
}