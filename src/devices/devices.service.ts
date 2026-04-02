import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) { }

  async register(userId: string, registerDeviceDto: RegisterDeviceDto) {
    const { token, platform } = registerDeviceDto;

    return this.prisma.device.upsert({
      where: { token },
      update: {
        userId,
        platform,
      },
      create: {
        token,
        platform,
        userId,
      },
    });
  }

  async removeToken(token: string) {
    console.log('Intentando borrar token:', token); // <--- Debug

    const result = await this.prisma.device.deleteMany({
      where: {
        token: token.trim()
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Token not found or already deleted`);
    }

    return { message: 'Device unregistered successfully', count: result.count };
  }

  // Este método lo usaremos luego para enviar las notificaciones
  async findByUserId(userId: string) {
    return this.prisma.device.findMany({
      where: { userId },
      select: { token: true },
    });
  }
}