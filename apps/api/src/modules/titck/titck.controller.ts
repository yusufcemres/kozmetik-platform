import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TitckService, TitckStatus } from './titck.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('TITCK')
@Controller('titck')
export class TitckController {
  constructor(private readonly titckService: TitckService) {}

  @Get('product/:id')
  @ApiOperation({ summary: 'Ürün TİTCK bildirim statusu' })
  getStatus(@Param('id', ParseIntPipe) id: number) {
    return this.titckService.getProductStatus(id);
  }

  @Post('product/:id/recheck')
  @ApiOperation({ summary: 'Banned INCI cross-check tekrar çalıştır' })
  recheck(@Param('id', ParseIntPipe) id: number) {
    return this.titckService.checkProduct(id);
  }

  @Post('admin/product/:id/notification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'reviewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: TİTCK bildirim no manuel ekle (kozmetikbildirim.titck.gov.tr yari-otomatik)' })
  setNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { notification_no: string; status?: TitckStatus },
  ) {
    return this.titckService.setNotification(id, body.notification_no, body.status || 'verified');
  }

  @Post('admin/rescan-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: tum publish edilmis kozmetikleri banned INCI ile yeniden tara' })
  rescanAll() {
    return this.titckService.rescanAll();
  }
}
