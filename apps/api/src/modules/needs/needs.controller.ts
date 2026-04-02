import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedsService } from './needs.service';
import { CreateNeedDto } from './dto/create-need.dto';
import { UpdateNeedDto } from './dto/update-need.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
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
  @ApiOperation({ summary: 'İhtiyaçları listele' })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'İhtiyaç detay (ID)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
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
