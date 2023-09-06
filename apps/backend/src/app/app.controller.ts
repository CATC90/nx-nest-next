import { Controller, Get } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('readiness')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Live for heart beat' })
  @ApiResponse({ status: 200, description: 'OK' })
  @Get('/live')
  live() {
    return { status: 'OK' };
  }

  @ApiOperation({ summary: 'Health for heart beat' })
  @ApiResponse({ status: 200, description: 'OK' })
  @Get('/health')
  health() {
    return { status: 'OK' };
  }
}
