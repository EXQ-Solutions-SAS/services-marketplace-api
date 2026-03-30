import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Generar slug automáticamente
    const slug = createCategoryDto.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      return await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          slug,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category name or slug already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}