import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(
        @Body('tableId') tableId: number | null,
        @Body('items') items: { itemId: number; quantity: number }[]
    ) {
        return this.ordersService.createOrder(tableId, items);
    }

    @Get()
    getAll() {
        return this.ordersService.findAll();
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: any) {
        return this.ordersService.updateStatus(Number(id), status);
    }
}