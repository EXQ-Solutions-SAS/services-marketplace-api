import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(firebaseId: string, email: string, name?: string) {
    // Upsert: Si existe por firebaseId, lo actualiza (o no hace nada), 
    // si no existe, lo crea.
    return this.prisma.user.upsert({
      where: { firebaseId },
      update: {
        email, // Por si el usuario cambió su email en Firebase
        name: name || undefined,
      },
      create: {
        firebaseId,
        email,
        name: name || 'Nuevo Usuario',
        role: Role.CLIENT, // Rol inicial por defecto
      },
    });
  }
}