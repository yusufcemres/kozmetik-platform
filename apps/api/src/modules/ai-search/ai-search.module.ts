import { Module } from '@nestjs/common';
import { AiSearchController } from './ai-search.controller';
import { ShortcutMatcherService } from './shortcut-matcher.service';
import { FallbackService } from './fallback.service';

@Module({
  controllers: [AiSearchController],
  providers: [ShortcutMatcherService, FallbackService],
  exports: [ShortcutMatcherService],
})
export class AiSearchModule {}
