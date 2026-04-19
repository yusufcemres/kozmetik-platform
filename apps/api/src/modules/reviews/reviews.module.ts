import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductReview } from '@database/entities';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductReview, Product]), UserAuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
