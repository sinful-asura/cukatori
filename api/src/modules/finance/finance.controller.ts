import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { ImportXmlBodyDto } from './finance.dto.js';
import { assertMonth, FinanceService } from './finance.service.js';
import { XmlImportService } from './xml-import.service.js';

type UploadedXml = {
  buffer?: Buffer;
  originalname?: string;
};

@Controller('finance')
@UseGuards(AuthGuard)
export class FinanceController {
  constructor(
    private readonly finance: FinanceService,
    private readonly importer: XmlImportService,
  ) {}

  @Get('categories')
  categories(@CurrentUser() user: User) {
    return this.finance.listCategories(user);
  }

  @Get('overview')
  overview(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.finance.overview(user, assertMonth(month) ?? undefined);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importXml(
    @CurrentUser() user: User,
    @UploadedFile() file: UploadedXml | undefined,
    @Body() body: ImportXmlBodyDto,
  ) {
    const xml = file?.buffer?.toString('utf8') ?? body.xml;
    if (!xml?.trim()) {
      throw new BadRequestException('Upload an XML file or send { xml }');
    }
    return this.importer.importXml(user, xml);
  }
}
