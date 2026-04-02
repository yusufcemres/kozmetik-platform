import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto, UpdateInteractionDto } from './dto/create-interaction.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Ingredient Interactions')
@Controller()
export class InteractionsController {
  constructor(private readonly service: InteractionsService) {}

  // === Public ===

  @Get('interactions')
  @ApiOperation({ summary: 'Etkileşim listesi (public)' })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'domain_type', required: false })
  findAll(
    @Query() query: PaginationDto,
    @Query('severity') severity?: string,
    @Query('domain_type') domain_type?: string,
  ) {
    return this.service.findAll({ ...query, severity, domain_type });
  }

  @Get('interactions/:id')
  @ApiOperation({ summary: 'Etkileşim detay' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('interactions/by-ingredient/:ingredientId')
  @ApiOperation({ summary: 'Ingredient etkileşimleri' })
  findByIngredient(@Param('ingredientId', ParseIntPipe) ingredientId: number) {
    return this.service.findByIngredient(ingredientId);
  }

  @Post('interactions/check-products')
  @ApiOperation({ summary: 'Ürünler arası etkileşim kontrolü (rutin/karşılaştırma)' })
  checkProducts(@Body() body: { product_ids: number[] }) {
    return this.service.checkProductInteractions(body.product_ids);
  }

  // === Admin ===

  @Post('admin/interactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'methodology_reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Etkileşim oluştur' })
  create(@Body() dto: CreateInteractionDto) {
    return this.service.create(dto);
  }

  @Put('admin/interactions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'methodology_reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Etkileşim güncelle' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInteractionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete('admin/interactions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Etkileşim sil' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
