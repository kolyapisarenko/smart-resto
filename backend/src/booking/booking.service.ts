import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

export interface Booking {
    id: number;
    name: string;
    phone: string;
    guests: number;
    date: string;
    status: 'CONFIRMED' | 'CANCELLED';
    createdAt: Date;
}

@Injectable()
export class BookingService {
    private bookings: Booking[] = [];
    private idCounter = 1;

    constructor(private readonly notificationService: NotificationService) { }

    async createBooking(bookingData: { name: string; phone: string; guests: number; date: string }): Promise<Booking> {
        const newBooking: Booking = {
            id: this.idCounter++,
            ...bookingData,
            status: 'CONFIRMED',
            createdAt: new Date(),
        };

        this.bookings.push(newBooking);

        // Асинхронно трігеримо шлюз повідомлень (Event-driven імітація)
        await this.notificationService.sendBookingConfirmation(
            newBooking.phone,
            newBooking.name,
            newBooking.date
        );

        return newBooking;
    }

    findAll(): Booking[] {
        return this.bookings;
    }
}