import { Controller, Post, Get, Body } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    @Post()
    create(@Body() body: { name: string; phone: string; guests: number; date: string }) {
        return this.bookingService.createBooking(body);
    }

    @Get()
    getAll() {
        return this.bookingService.findAll();
    }
}