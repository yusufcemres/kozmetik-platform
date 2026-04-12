import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavorite, Product } from '@database/entities';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserFavorite, Product]), UserAuthModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
