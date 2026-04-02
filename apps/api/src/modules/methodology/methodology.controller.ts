import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MethodologyService } from './methodology.service';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Methodology')
@Controller('methodology')
export class MethodologyController {
  constructor(private readonly service: MethodologyService) {}

  @Get('evidence-levels')
  @ApiOperation({ summary: 'Kanıt seviyeleri listesi' })
  getEvidenceLevels() {
    return this.service.getEvidenceLevels();
  }

  @Put('evidence-levels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'methodology_reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kanıt seviyesi güncelle' })
  updateEvidenceLevel(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.updateEvidenceLevel(id, data);
  }

  @Get('approved-wordings')
  @ApiOperation({ summary: 'Onaylı ifadeler listesi' })
  @ApiQuery({ name: 'category', required: false })
  getApprovedWordings(
    @Query() query: PaginationDto,
    @Query('category') category?: string,
  ) {
    return this.service.getApprovedWordings({ ...query, category });
  }

  @Post('approved-wordings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'methodology_reviewer', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Onaylı ifade oluştur' })
  createWording(@Body() data: any) {
    return this.service.createWording(data);
  }

  @Put('approved-wordings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'methodology_reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Onaylı ifade güncelle' })
  updateWording(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.updateWording(id, data);
  }

  @Delete('approved-wordings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'methodology_reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Onaylı ifade soft-delete' })
  removeWording(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeWording(id);
  }
}
