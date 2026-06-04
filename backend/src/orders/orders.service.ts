import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MenuService } from '../menu/menu.service';
import { PaymentService } from '../payment/payment.service'; // Імпорт платіжного шлюзу
import { PrismaService } from 'prisma/prisma.service';     // Імпорт Prisma з правильним відносним шляхом
import { OrderStatus, PaymentStatus } from '@prisma/client';  // ПРАВИЛЬНИЙ ІМПОРТ ЕНУМІВ ДЛЯ БЕКЕНДУ

// Інтерфейси залишаємо для зворотної сумісності з типами вашого фронтенду
export interface OrderItem {
    itemId: number;
    title: string;
    quantity: number;
    priceAtSale: number;
}

export interface Order {
    id: number;
    tableId: number | null;
    items: OrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
    paymentStatus: 'PAID' | 'UNPAID';
    transactionId?: string;
    createdAt: Date;
}

@Injectable()
export class OrdersService {
    // Конструктор приймає PrismaService, а також твої існуючі сервіси
    constructor(
        private readonly prisma: PrismaService,
        private readonly menuService: MenuService,
        private readonly paymentService: PaymentService,
    ) { }

    // Асинхронне створення замовлення з транзакційним записом у PostgreSQL
    async createOrder(
        tableId: number | null,
        clientItems: { itemId: number; quantity: number }[],
        paymentRequired: boolean = false
    ): Promise<any> { // Повертає створене замовлення з БД
        if (!clientItems || clientItems.length === 0) {
            throw new BadRequestException('Кошик порожній, неможливо створити замовлення');
        }

        const confirmedItems: { itemId: number; title: string; quantity: number; priceAtSale: number }[] = [];
        let totalAmount = 0;

        // ВИКОРИСТОВУЄМО ЦИКЛ, ЩОБ ПРАВИЛЬНО ОБРОБИТИ АСИНХРОННИЙ ЗАПИТ ДО БАЗЫ МЕНЮ
        for (const ci of clientItems) {
            // Обов'язково додаємо await, оскільки MenuService тепер робить запит до PostgreSQL
            const dish = await this.menuService.findById(ci.itemId);

            if (!dish) {
                throw new NotFoundException(`Страву з ID ${ci.itemId} не знайдено в меню`);
            }

            confirmedItems.push({
                itemId: dish.id,
                title: dish.title, // Зберігаємо для локальної логіки
                quantity: ci.quantity,
                priceAtSale: dish.price,
            });

            totalAmount += dish.price * ci.quantity;
        }

        // Початкові статуси
        let currentPaymentStatus: PaymentStatus = PaymentStatus.UNPAID;
        let transactionId: string | undefined = undefined;

        // Симуляція оплати через твій платіжний сервіс
        if (paymentRequired) {
            const paymentResult = await this.paymentService.processPayment(Date.now(), totalAmount);
            if (paymentResult.success) {
                currentPaymentStatus = PaymentStatus.PAID;
                transactionId = paymentResult.transactionId;
            }
        }

        // Записуємо дані у PostgreSQL через Prisma (використовуємо вкладений запис Nested Write)
        const savedOrder = await this.prisma.order.create({
            data: {
                tableId: tableId ? Number(tableId) : null,
                totalAmount: totalAmount,
                status: OrderStatus.PENDING, // Початковий статус PENDING з Prisma Client
                paymentStatus: currentPaymentStatus,
                transactionId: transactionId,
                items: {
                    create: confirmedItems.map(item => ({
                        itemId: Number(item.itemId),
                        quantity: Number(item.quantity),
                        priceAtSale: item.priceAtSale
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        menuItem: true // Підтягуємо деталі страви з таблиці MenuItem
                    }
                }
            }
        });

        return savedOrder;
    }

    // Отримання всіх активних замовлень (без SERVED) з бази даних
    async findAll(): Promise<any[]> {
        return this.prisma.order.findMany({
            where: {
                NOT: {
                    status: OrderStatus.SERVED
                }
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc' // Нові замовлення будуть зверху
            }
        });
    }

    // Оновлення статусу замовлення безпосередньо у PostgreSQL
    async updateStatus(id: number, status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED'): Promise<any> {
        const numericId = Number(id);

        // Перевіряємо чи існує таке замовлення
        const orderExists = await this.prisma.order.findUnique({
            where: { id: numericId }
        });

        if (!orderExists) {
            throw new BadRequestException('Замовлення не знайдено в базі даних');
        }

        // Мапимо строковий статус з фронтенду на Enum з Prisma
        const prismaStatus = OrderStatus[status];

        return this.prisma.order.update({
            where: { id: numericId },
            data: { status: prismaStatus },
            include: {
                items: true
            }
        });
    }
}