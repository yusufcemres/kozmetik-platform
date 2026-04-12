import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FavoritesService } from './favorites.service';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(AppJwtGuard)
@Throttle({ public: { limit: 60, ttl: 60_000 } })
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının favori ürünleri' })
  async list(@Req() req: any) {
    return this.service.list(req.user.user_id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Ürünü favorilere ekle' })
  async add(@Req() req: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.service.add(req.user.user_id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Ürünü favorilerden kaldır' })
  async remove(@Req() req: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.service.remove(req.user.user_id, productId);
  }

  @Post('toggle/:productId')
  @ApiOperation({ summary: 'Favori durumunu tersine çevir' })
  async toggle(@Req() req: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.service.toggle(req.user.user_id, productId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'LocalStorage → DB migration (ilk login)' })
  async bulk(@Req() req: any, @Body() body: { product_ids: number[] }) {
    return this.service.bulkAdd(req.user.user_id, body?.product_ids || []);
  }
}
