import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Asegúrate de que la ruta sea correcta

@Module({
  imports: [PrismaModule], 
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}