import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) { }

  async create(createServiceDto: CreateServiceDto, userId: string) {
    const { categoryId, ...serviceData } = createServiceDto;

    // 1. Buscamos al usuario para ver su rol actual
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { provider: true } // Traemos el perfil de provider si existe
    });

    if (!user) throw new NotFoundException('User not found');

    let provider = user.provider;

    // 2. Si no tiene perfil de Provider, lo creamos
    if (!provider) {
      provider = await this.prisma.provider.create({
        data: {
          userId: userId,
          category: 'General',
          bio: `Perfil profesional de ${user.name || 'Usuario'}`,
        },
      });

      // 3. CAMBIO OBLIGATORIO: Solo si es CLIENT, lo pasamos a PROVIDER
      // Si es ADMIN, se queda como ADMIN pero ya tiene su perfil de provider arriba
      if (user.role === 'CLIENT') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { role: 'PROVIDER' },
        });
      }
    }

    // 4. Crear el servicio conectado al perfil de Provider
    return this.prisma.service.create({
      data: {
        ...serviceData,
        category: { connect: { id: categoryId } },
        provider: { connect: { id: provider.id } },
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { name: true } },
        provider: {
          include: {
            user: { // <--- AQUÍ entramos a la tabla User
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        provider: {
          include: {
            user: { // <--- AQUÍ entramos a la tabla User
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, userId: string) {
    const service = await this.findOne(id);

    if (service.providerId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this service');
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string, userId: string) {
    const service = await this.findOne(id);

    if (service.providerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this service');
    }

    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}