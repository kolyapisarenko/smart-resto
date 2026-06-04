import { Module } from '@nestjs/common';
import { CallsController } from './calls.controller';
import { OrdersController } from 'src/orders/orders.controller';

@Module({
    imports: [],
    controllers: [
        OrdersController,
        CallsController
    ],
    providers: [],
})
export class AppModule { }