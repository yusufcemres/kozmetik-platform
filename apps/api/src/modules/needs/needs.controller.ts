import {
  Body, Controller, Delete, Get, Header, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NeedsService } from './needs.service';
import { CreateNeedDto } from './dto/create-need.dto';
import { UpdateNeedDto } from './dto/update-need.dto';
import { NeedFilterDto } from './dto/need-filter.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Needs')
@Controller('needs')
export class NeedsController {
  constructor(private readonly service: NeedsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'İhtiyaç oluştur' })
  create(@Body() dto: CreateNeedDto) {
    return this.service.create(dto);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
  @ApiOperation({ summary: 'İhtiyaçları listele' })
  findAll(@Query() query: NeedFilterDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
  @ApiOperation({ summary: 'İhtiyaç detay (ID)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
  @Header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
  @ApiOperation({ summary: 'İhtiyaç detay (slug)' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'İhtiyaç güncelle' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNeedDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'taxonomy_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'İhtiyaç soft-delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
