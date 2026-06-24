import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MealsModule } from '../meals/meals.module';
import { UsersModule } from '../users/users.module';
import { MongoAnalyticsRepository } from '../../infrastructure/database/mongodb/repositories/mongo-analytics.repository';
import { MongoDashboardRepository } from '../../infrastructure/database/mongodb/repositories/mongo-dashboard.repository';
import { GetDashboardUseCase } from '../../application/use-cases/analytics/get-dashboard.usecase';

@Module({
  imports: [MealsModule, UsersModule],
  controllers: [AnalyticsController, DashboardController],
  providers: [
    GetDashboardUseCase,
    DashboardService,
    {
      provide: 'IAnalyticsRepository',
      useClass: MongoAnalyticsRepository,
    },
    {
      provide: 'IDashboardRepository',
      useClass: MongoDashboardRepository,
    },
  ],
  exports: [GetDashboardUseCase, DashboardService, 'IAnalyticsRepository', 'IDashboardRepository'],
})
export class AnalyticsModule {}
