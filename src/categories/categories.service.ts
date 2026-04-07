import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);

    try {
      return await this.prisma.category.create({
        data: { ...createCategoryDto, slug },
      });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('Category name or slug already exists');
      throw error;
    }
  }

  // Cambiado: Solo busca en la tabla category y filtra los deletedAt
  async findAll() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null }, // No permitimos ver categorías "borradas"
      include: { _count: { select: { services: true } } },
    });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    let slug = category.slug;

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      slug = this.generateSlug(updateCategoryDto.name);
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: { ...updateCategoryDto, slug },
      });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('Name or Slug already exists');
      throw error;
    }
  }

  // BORRADO LÓGICO: Simplificado para Admin
  async remove(id: string) {
    await this.findOne(id); // Valida que exista y no esté ya borrada

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Helper privado para no repetir código de slug
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
