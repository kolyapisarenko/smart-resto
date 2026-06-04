import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger('PaymentService');

    async processPayment(orderId: number, amount: number): Promise<{ success: boolean; transactionId: string }> {
        this.logger.log(`💳 [ПЛАТІЖНИЙ ШЛЮЗ] Ініціалізовано оплату замовлення №${orderId} на суму ${amount} ₴`);

        // Імітуємо затримку відповіді від банку (LiqPay API)
        await new Promise(resolve => setTimeout(resolve, 1200));

        const transactionId = 'trx_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        this.logger.log(`✅ [ПЛАТІЖ УСПІШНИЙ] Транзакція ${transactionId} підтверджена банком-екваєром.`);

        return {
            success: true,
            transactionId,
        };
    }
}