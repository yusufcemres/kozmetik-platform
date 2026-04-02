import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, SuggestQueryDto } from './dto/search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Arama (ürün, içerik, ihtiyaç)' })
  search(@Query() query: SearchQueryDto) {
    return this.service.search(query);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Auto-suggest önerileri' })
  suggest(@Query() query: SuggestQueryDto) {
    return this.service.suggest(query);
  }
}
