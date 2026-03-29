import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Para que no tengas que importarlo en cada módulo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
