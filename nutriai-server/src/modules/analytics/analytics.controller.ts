import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetDashboardUseCase } from '../../application/use-cases/analytics/get-dashboard.usecase';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get('dashboard')
  async getDashboardData(@Request() req) {
    return this.getDashboardUseCase.execute(req.user.id);
  }
}
