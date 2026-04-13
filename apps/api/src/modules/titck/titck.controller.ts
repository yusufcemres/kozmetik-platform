import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TitckService } from './titck.service';

@Controller('titck')
export class TitckController {
  constructor(private readonly titckService: TitckService) {}

  @Get('product/:id')
  getStatus(@Param('id', ParseIntPipe) id: number) {
    return this.titckService.getProductStatus(id);
  }

  @Post('product/:id/recheck')
  recheck(@Param('id', ParseIntPipe) id: number) {
    return this.titckService.checkProduct(id);
  }
}
