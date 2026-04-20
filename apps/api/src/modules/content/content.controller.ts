import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Content')
@Controller('articles')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Makale oluştur' })
  create(@Body() dto: CreateArticleDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Yayınlanmış makaleler (public)' })
  @ApiQuery({ name: 'content_type', required: false })
  findPublished(
    @Query() query: PaginationDto,
    @Query('content_type') content_type?: string,
  ) {
    return this.service.findPublished({ ...query, content_type });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor', 'reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm makaleler (admin)' })
  @ApiQuery({ name: 'content_type', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query() query: PaginationDto,
    @Query('content_type') content_type?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ ...query, content_type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Makale detay (ID)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Makale detay (slug)' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get('sitemap/all')
  @ApiOperation({ summary: 'Sitemap için yayınlanmış makale slugları' })
  sitemap() {
    return this.service.getSitemap();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Makale güncelle' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Makale arşivle' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
