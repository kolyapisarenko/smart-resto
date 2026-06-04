import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        return this.authService.login(body.username, body.password);
    }

    @Get('me')
    async getMe(@Headers('authorization') authHeader: string) {
        if (!authHeader) {
            throw new UnauthorizedException('Токен відсутній');
        }
        // Очікуємо формат "Bearer <token>"
        const token = authHeader.split(' ')[1];
        return this.authService.validateToken(token);
    }
}