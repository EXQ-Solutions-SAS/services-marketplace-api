import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service'; // Asegúrate de importar tu servicio

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  // Inyectamos UsersService en lugar de Prisma directamente
  constructor(private usersService: UsersService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Usamos la lógica de Upsert que ya tienes en tu UsersService
      const user = await this.usersService.findOrCreateUser(
        decodedToken.uid,
        decodedToken.email || 'no-email@firebase.com',
        decodedToken.name
      );

      // Si el usuario está borrado lógicamente, no lo dejamos pasar
      if (user.deletedAt) {
        throw new UnauthorizedException('User account is deactivated');
      }

      // Inyectamos el usuario completo de Postgres en la request
      request['user'] = user;

      return true;
    }catch (error: any) {
      throw new UnauthorizedException(error.message || 'Invalid token or sync failed');
    }
  }
}