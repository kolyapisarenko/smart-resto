import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService], // Експортуємо, щоб модуль замовлень міг перевіряти ціни страв
})
export class MenuModule { }