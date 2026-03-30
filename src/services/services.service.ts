import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) { }

  async create(createServiceDto: CreateServiceDto, userId: string) {
    // 1. Verificación de seguridad: si userId es undefined, algo falló en el AuthGuard
    if (!userId) {
      throw new Error('User ID is required to create a service. Check your AuthGuard.');
    }

    // 2. Crear el servicio usando 'connect' para las relaciones
    return this.prisma.service.create({
      data: {
        title: createServiceDto.title,
        description: createServiceDto.description,
        pricePerHour: createServiceDto.pricePerHour,
        // Usamos connect para indicarle a Prisma que use registros existentes
        category: {
          connect: { id: createServiceDto.categoryId }
        },
        provider: {
          connect: { id: userId }
        },
      },
      include: {
        category: { select: { name: true, basePrice: true } },
        provider: { select: { name: true } }
      }
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      include: {
        category: { select: { name: true } },
        provider: { select: { name: true, email: true } },
      },
    });
  }
}