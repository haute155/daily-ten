import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { EntriesService } from './entries.service';
import { UpsertEntryDto } from './dto/upsert-entry.dto';

@Controller('entries')
@UseGuards(JwtAuthGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.entriesService.findAll(user.sub);
  }

  @Put(':date')
  upsert(
    @CurrentUser() user: JwtPayload,
    @Param('date') date: string,
    @Body() dto: UpsertEntryDto,
  ) {
    return this.entriesService.upsert(user.sub, date, dto);
  }
}
