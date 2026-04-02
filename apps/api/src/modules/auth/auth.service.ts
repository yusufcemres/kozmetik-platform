import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '@database/entities';
import { LoginDto, LoginResponseDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.adminUserRepo.findOne({
      where: { email: dto.email },
      relations: ['role'],
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    // Update last login
    await this.adminUserRepo.update(user.admin_user_id, {
      last_login_at: new Date(),
    });

    const payload: JwtPayload = {
      sub: user.admin_user_id,
      email: user.email,
      role_key: user.role.role_key,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        admin_user_id: user.admin_user_id,
        email: user.email,
        full_name: user.full_name,
        role_key: user.role.role_key,
        permissions: user.role.permissions || [],
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
