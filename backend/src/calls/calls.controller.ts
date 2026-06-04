import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CallType } from '@prisma/client'; // Імпортуємо енум, згенерований Призмою

@Controller('calls')
export class CallsController {
    // Інжектуємо Prisma через конструктор контролера
    constructor(private readonly prisma: PrismaService) { }

    @Post()
    async createCall(
        @Body('tableId') tableId: number,
        @Body('type') type: 'WAITER' | 'BILL' | 'HELP'
    ) {
        const numericTableId = Number(tableId);
        const prismaCallType = CallType[type]; // Мапимо рядок з фронтенду на Enum з бази

        // Використовуємо upsert: якщо виклик від цього столика вже є — ми його оновимо (скинемо час),
        // якщо немає — створимо новий. Це замінює твою логіку з filter() і push().
        const savedCall = await this.prisma.serviceCall.upsert({
            where: { tableId: numericTableId },
            update: {
                type: prismaCallType,
                createdAt: new Date() // Оновлюємо час виклику на поточний
            },
            create: {
                tableId: numericTableId,
                type: prismaCallType
            }
        });

        return { success: true, call: savedCall };
    }

    @Get()
    async getCalls() {
        // Забираємо всі активні виклики з PostgreSQL та сортуємо їх, щоб найновіші були зверху
        return this.prisma.serviceCall.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    @Delete(':tableId')
    async resolveCall(@Param('tableId') tableId: string) {
        const numericTableId = Number(tableId);

        try {
            // Видаляємо запис про виклик для конкретного столика
            await this.prisma.serviceCall.delete({
                where: { tableId: numericTableId }
            });
            return { success: true };
        } catch (error) {
            // Якщо офіціант двічі натиснув "видалити" і запису вже немає, повертаємо success, щоб фронтенд не падав
            return { success: true, message: 'Виклик вже був видалений або не існував' };
        }
    }
}