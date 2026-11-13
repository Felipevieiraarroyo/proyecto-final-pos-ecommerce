import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name.trim();

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException('Já existe uma categoria com esse nome.');
    }

    try {
      return await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          name,
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }

      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    const data = { ...updateCategoryDto };

    if (data.name !== undefined) {
      const name = data.name.trim();

      const existingCategory = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }

      data.name = name;
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }

      throw error;
    }
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        'Não é possível excluir uma categoria que possui produtos vinculados.',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
