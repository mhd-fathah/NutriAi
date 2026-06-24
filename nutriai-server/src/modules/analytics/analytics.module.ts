import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MealsModule } from '../meals/meals.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MealsModule, UsersModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
