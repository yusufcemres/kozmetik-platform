import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const BRAND_PLAN_KEY = 'brand_plan';
export const RequirePlan = (...plans: string[]) => SetMetadata(BRAND_PLAN_KEY, plans);

@Injectable()
export class BrandPlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.getAllAndOverride<string[]>(BRAND_PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlans || requiredPlans.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.plan) {
      throw new ForbiddenException('Plan bilgisi bulunamadı');
    }

    const planHierarchy: Record<string, number> = {
      starter: 1,
      professional: 2,
      enterprise: 3,
    };

    const userLevel = planHierarchy[user.plan] || 0;
    const minRequired = Math.min(...requiredPlans.map((p) => planHierarchy[p] || 99));

    if (userLevel < minRequired) {
      throw new ForbiddenException(
        `Bu özellik ${requiredPlans.join(' veya ')} plan gerektirir. Mevcut planınız: ${user.plan}`,
      );
    }

    return true;
  }
}
