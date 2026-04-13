import { Module } from '@nestjs/common';
import { ProfileCalculatorService } from './profile-calculator.service';
import { RecommendationMatcherService } from './recommendation-matcher.service';
import { ProfileEngineController } from './profile-engine.controller';

@Module({
  controllers: [ProfileEngineController],
  providers: [ProfileCalculatorService, RecommendationMatcherService],
  exports: [ProfileCalculatorService, RecommendationMatcherService],
})
export class ProfileEngineModule {}
