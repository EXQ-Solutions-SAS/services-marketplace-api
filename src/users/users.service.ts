import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta si es necesario

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

}