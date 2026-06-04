import { Module } from '@nestjs/common';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { BookingModule } from './booking/booking.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { TableModule } from './table/table.module';

@Module({
  imports: [MenuModule, OrdersModule, BookingModule, NotificationModule, PaymentModule, AuthModule, TableModule],
})
export class AppModule { }