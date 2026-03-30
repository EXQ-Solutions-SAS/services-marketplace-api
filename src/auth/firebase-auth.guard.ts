import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // 1. Intentar buscar al usuario
      let user = await this.prisma.user.findUnique({
        where: { firebaseId: decodedToken.uid },
      });

      // 2. SI NO EXISTE, LO CREAMOS (Sincronización automática)
      if (!user) {
        const email = decodedToken.email ?? 'no-email@firebase.com';
        const name = decodedToken.name ?? email.split('@')[0];
        user = await this.prisma.user.create({
          data: {
            firebaseId: decodedToken.uid,
            email: email,
            name: name,
            role: 'CLIENT', // Rol por defecto
          },
        });
        console.log('Nuevo usuario replicado en Postgres:', user.email);
      }

      // 3. Inyectar el usuario de Postgres en el request
      request['user'] = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or sync failed');
    }
  }
}