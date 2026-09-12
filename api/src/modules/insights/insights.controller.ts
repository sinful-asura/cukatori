import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { CreateDiscomfortDto, UpdateDiscomfortDto } from './discomfort.dto.js';
import { HeatmapService } from './heatmap.service.js';
import { InsightsService } from './insights.service.js';
import { SubstituteService } from './substitute.service.js';

@Controller('insights')
@UseGuards(AuthGuard)
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get('catalog')
  catalog() {
    return this.insights.catalog();
  }

  @Get('plateaus')
  plateaus(@CurrentUser() user: User) {
    return this.insights.plateaus(user);
  }

  @Get('deload')
  deload(@CurrentUser() user: User) {
    return this.insights.deload(user);
  }

  @Post('deload/dismiss')
  dismissDeload(@CurrentUser() user: User) {
    return this.insights.dismissDeload(user);
  }
}

@Controller('discomfort')
@UseGuards(AuthGuard)
export class DiscomfortController {
  constructor(private readonly insights: InsightsService) {}

  @Get()
  list(@CurrentUser() user: User, @Query('region') region?: string) {
    return this.insights.listDiscomfort(user, region);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateDiscomfortDto) {
    return this.insights.createDiscomfort(user, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateDiscomfortDto) {
    return this.insights.updateDiscomfort(user, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.insights.removeDiscomfort(user, id);
  }
}

@Controller('exercises')
@UseGuards(AuthGuard)
export class SubstitutesController {
  constructor(private readonly substitutes: SubstituteService) {}

  @Get(':id/substitutes')
  list(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('discomfort') discomfort?: string,
  ) {
    return this.substitutes.list(user.id, id, discomfort);
  }
}

@Controller('heatmaps')
@UseGuards(AuthGuard)
export class HeatmapsController {
  constructor(private readonly heatmaps: HeatmapService) {}

  @Get(':kind')
  get(
    @CurrentUser() user: User,
    @Param('kind') kind: string,
    @Query('year') year?: string,
  ) {
    return this.heatmaps.get(user, kind, year);
  }
}
