import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MenuModule } from '../menu/menu.module';
import { PaymentModule } from 'src/payment/payment.module';
import { CallsController } from 'src/calls/calls.controller';

@Module({
    imports: [MenuModule, PaymentModule], // Імпортуємо MenuModule, щоб бачити ціни та страви
    controllers: [OrdersController, CallsController],
    providers: [OrdersService],
})
export class OrdersModule { }