import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import * as admin from 'firebase-admin';

interface RequestWithUser extends Request {
  user: admin.auth.DecodedIdToken;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  getHello(@Req() req: RequestWithUser): string {
    const user = req.user;
    console.log('Usuario autenticado:', user.email);
    return `Hola ${user.name || 'Usuario'}, bienvenido a EXQ Solutions!`;
  }
}
