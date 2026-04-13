import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CrossSellService } from './cross-sell.service';

@Controller('cross-sell')
export class CrossSellController {
  constructor(private readonly service: CrossSellService) {}

  @Get('product/:id/together')
  together(@Param('id', ParseIntPipe) id: number) {
    return this.service.togetherBetter(id);
  }

  @Get('product/:id/same-brand')
  sameBrand(@Param('id', ParseIntPipe) id: number) {
    return this.service.sameBrand(id);
  }

  @Get('product/:id/similar')
  similar(@Param('id', ParseIntPipe) id: number) {
    return this.service.similarByNeeds(id);
  }
}
