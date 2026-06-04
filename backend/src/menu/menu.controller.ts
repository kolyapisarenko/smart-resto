import { Controller, Get, Param, Patch } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Get()
    async getMenu() {
        return await this.menuService.findAll();
    }

    @Patch(':id/toggle')
    async toggleStatus(@Param('id') id: string) {
        return await this.menuService.toggleAvailability(Number(id));
    }
}