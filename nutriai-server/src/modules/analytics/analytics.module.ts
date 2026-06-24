import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { MealsModule } from '../meals/meals.module';
import { UsersModule } from '../users/users.module';
import { MongoAnalyticsRepository } from '../../infrastructure/database/mongodb/repositories/mongo-analytics.repository';
import { GetDashboardUseCase } from '../../application/use-cases/analytics/get-dashboard.usecase';

@Module({
  imports: [MealsModule, UsersModule],
  controllers: [AnalyticsController],
  providers: [
    GetDashboardUseCase,
    {
      provide: 'IAnalyticsRepository',
      useClass: MongoAnalyticsRepository,
    },
  ],
  exports: [GetDashboardUseCase, 'IAnalyticsRepository'],
})
export class AnalyticsModule {}
