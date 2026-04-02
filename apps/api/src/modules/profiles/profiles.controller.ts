import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateSkinProfileDto } from './dto/create-profile.dto';
import { UpdateSkinProfileDto } from './dto/update-profile.dto';

@ApiTags('Skin Profiles')
@Controller('skin-profiles')
export class ProfilesController {
  constructor(private readonly service: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Anonim cilt profili oluştur' })
  create(@Body() dto: CreateSkinProfileDto) {
    return this.service.create(dto);
  }

  @Get(':anonymousId')
  @ApiOperation({ summary: 'Profil getir' })
  findOne(@Param('anonymousId') anonymousId: string) {
    return this.service.findByAnonymousId(anonymousId);
  }

  @Put(':anonymousId')
  @ApiOperation({ summary: 'Profil güncelle' })
  update(
    @Param('anonymousId') anonymousId: string,
    @Body() dto: UpdateSkinProfileDto,
  ) {
    return this.service.update(anonymousId, dto);
  }
}
