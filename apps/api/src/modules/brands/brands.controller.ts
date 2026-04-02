import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka oluştur' })
  create(@Body() dto: CreateBrandDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Markaları listele' })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Marka detay (ID)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Marka detay (slug)' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka güncelle' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka soft-delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
