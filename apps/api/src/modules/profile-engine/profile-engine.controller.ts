import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProfileCalculatorService, QuizAnswers } from './profile-calculator.service';
import { RecommendationMatcherService } from './recommendation-matcher.service';

@Controller('profile-engine')
export class ProfileEngineController {
  constructor(
    private readonly calculator: ProfileCalculatorService,
    private readonly matcher: RecommendationMatcherService,
  ) {}

  @Post('quiz/submit')
  async submit(
    @Body() body: { user_id?: number; anonymous_key?: string; answers: QuizAnswers; quiz_version?: string },
  ) {
    const profile = this.calculator.fromAnswers(body.answers);
    if (body.user_id) {
      await this.calculator.saveProfile(body.user_id, profile, body.quiz_version || 'v1');
    }
    await this.calculator.saveSession(
      body.user_id || null,
      body.anonymous_key || null,
      body.answers,
      profile,
      body.quiz_version || 'v1',
    );
    return { profile };
  }

  @Get('user/:id/profile')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.calculator.getProfile(id);
  }

  @Get('user/:id/recommendations')
  recs(@Param('id', ParseIntPipe) id: number) {
    return this.matcher.matchForUser(id);
  }

  @Get('user/:userId/product/:productId/allergy-check')
  allergy(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.matcher.checkProductAllergyForUser(userId, productId);
  }
}
