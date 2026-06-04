import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { TableService } from './table.service';
import { TableStatus } from '@prisma/client';

@Controller('tables') // /api/v1/tables
export class TableController {
    constructor(private readonly tableService: TableService) { }

    @Get()
    async getTables() {
        return this.tableService.getAllTables();
    }

    // Змінили назву параметра на :number, щоб логічно відповідати QR-кодам
    @Patch(':number/status')
    async changeStatus(
        @Param('number', ParseIntPipe) number: number,
        @Body('status') status: TableStatus,
    ) {
        // Викликаємо метод сервісу, який шукає за номером столу
        return this.tableService.updateTableStatusByNumber(number, status);
    }
}