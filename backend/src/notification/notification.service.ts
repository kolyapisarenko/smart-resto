import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger('NotificationService');

    async sendBookingConfirmation(phone: string, name: string, date: string): Promise<boolean> {
        // Симулюємо затримку мережі при роботі з SMS-провайдером (наприклад, TurboSMS)
        await new Promise(resolve => setTimeout(resolve, 800));

        this.logger.log(`📱 [SMS НАДІСЛАНО] Кому: ${phone} (${name}). Текст: "Ваш стіл успішно заброньовано на ${date}. Чекаємо на вас!"`);
        return true;
    }
}