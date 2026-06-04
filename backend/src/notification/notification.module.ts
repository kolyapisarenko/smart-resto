import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
    providers: [NotificationService],
    exports: [NotificationService], // Експортуємо, щоб інші модулі могли викликати сповіщення
})
export class NotificationModule { }