import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async getDashboardOverview(userId: string) {
    const startTime = Date.now();
    const data = await this.dashboardRepository.getDashboardOverview(userId);
    const endTime = Date.now();
    
    this.logger.log(`[Dashboard Query Time] ${endTime - startTime}ms`);
    return data;
  }
}
