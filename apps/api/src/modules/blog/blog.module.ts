import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { ReviewersService } from './reviewers.service';
import { InternalLinkingService } from './internal-linking.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService, ReviewersService, InternalLinkingService],
  exports: [BlogService, ReviewersService],
})
export class BlogModule {}
