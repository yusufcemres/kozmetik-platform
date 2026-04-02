import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori oluştur' })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Kategorileri listele' })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Kategori ağacı' })
  getTree() {
    return this.service.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kategori detay (ID)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Kategori detay (slug)' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori güncelle' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori soft-delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
