// src/auth/guards/firebase-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {} // Inyecta Prisma

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // BUSCA AL USUARIO EN TU DB USANDO EL UID DE FIREBASE
      const user = await this.prisma.user.findUnique({
        where: { firebaseId: decodedToken.uid },
      });

      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }

      // INYECTA EL USUARIO COMPLETO DE TU DB EN EL REQUEST
      request['user'] = user; 
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or user session');
    }
  }
}