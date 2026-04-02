import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  admin_user_id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty()
  role_key: string;

  @ApiProperty()
  permissions: string[];
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: AuthUserDto;
}
