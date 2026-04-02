import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MappingsService } from './mappings.service';
import { CreateIngredientNeedMappingDto } from './dto/create-mapping.dto';
import { UpdateIngredientNeedMappingDto } from './dto/update-mapping.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Ingredient-Need Mappings')
@Controller('ingredient-need-mappings')
export class MappingsController {
  constructor(private readonly service: MappingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'İçerik-ihtiyaç eşleşmesi oluştur' })
  create(@Body() dto: CreateIngredientNeedMappingDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Eşleşmeleri listele' })
  @ApiQuery({ name: 'ingredient_id', required: false })
  @ApiQuery({ name: 'need_id', required: false })
  findAll(
    @Query() query: PaginationDto,
    @Query('ingredient_id') ingredient_id?: number,
    @Query('need_id') need_id?: number,
  ) {
    return this.service.findAll({ ...query, ingredient_id, need_id });
  }

  @Get('by-ingredient/:ingredientId')
  @ApiOperation({ summary: 'İçerik maddesine göre eşleşmeler' })
  findByIngredient(@Param('ingredientId', ParseIntPipe) ingredientId: number) {
    return this.service.findByIngredient(ingredientId);
  }

  @Get('by-need/:needId')
  @ApiOperation({ summary: 'İhtiyaca göre eşleşmeler' })
  findByNeed(@Param('needId', ParseIntPipe) needId: number) {
    return this.service.findByNeed(needId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Eşleşme detay' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eşleşme güncelle' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIngredientNeedMappingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eşleşme sil' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
