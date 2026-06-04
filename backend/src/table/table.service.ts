import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TableStatus } from '@prisma/client';

@Injectable()
export class TableService {
    constructor(private prisma: PrismaService) { }

    // Отримати всі столи для адмінки та офіціантів
    async getAllTables() {
        return this.prisma.table.findMany({
            orderBy: { number: 'asc' },
        });
    }

    // Оновити тільки статус конкретного столу
    // Оновити статус за номером столу (так безпечніше для QR-кодів)
    async updateTableStatusByNumber(tableNumber: number, status: TableStatus) {
        const table = await this.prisma.table.findUnique({ where: { number: tableNumber } });
        if (!table) {
            throw new NotFoundException(`Стіл №${tableNumber} не знайдено`);
        }

        return this.prisma.table.update({
            where: { number: tableNumber },
            data: { status },
        });
    }
}