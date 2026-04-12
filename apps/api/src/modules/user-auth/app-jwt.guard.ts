import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AppJwtGuard extends AuthGuard('app-jwt') {}
