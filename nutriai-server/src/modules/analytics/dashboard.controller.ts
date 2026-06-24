import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard-overview')
  async getDashboardOverview(@Request() req) {
    const startTime = Date.now();
    const data = await this.dashboardService.getDashboardOverview(req.user.id);
    const endTime = Date.now();
    
    this.logger.log(`[Dashboard Response Time] ${endTime - startTime}ms`);
    return {
      success: true,
      data,
    };
  }
}
