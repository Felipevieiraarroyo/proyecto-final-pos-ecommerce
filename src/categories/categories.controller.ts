import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Categorias')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Criar categoria',
  })
  @ApiResponse({
    status: 201,
    description: 'Categoria criada.',
    example: {
      id: 3,
      name: 'Periféricos',
      description: 'Periféricos para computadores.',
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar categorias',
    description: 'Retorna todas as categorias cadastradas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias.',
    example: [
      {
        id: 1,
        name: 'Eletrônicos',
        description: 'Produtos eletrônicos e acessórios tecnológicos.',
      },
      {
        id: 2,
        name: 'Acessórios',
        description: 'Acessórios para computadores e dispositivos.',
      },
    ],
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da categoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada.',
    example: {
      id: 1,
      name: 'Eletrônicos',
      description: 'Produtos eletrônicos e acessórios tecnológicos.',
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da categoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada.',
    example: {
      id: 1,
      name: 'Eletrônicos',
      description: 'Produtos eletrônicos e acessórios tecnológicos.',
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiParam({
    name: 'id',
    example: 2,
    description: 'ID da categoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria removida.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
