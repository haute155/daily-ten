import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';

@Controller('versions')
@UseGuards(JwtAuthGuard)
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.versionsService.findAll(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVersionDto) {
    return this.versionsService.create(user.sub, dto);
  }
}
