import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Meal, MealSchema } from '../../infrastructure/database/mongodb/schemas/meal.schema';
import { MongoMealRepository } from '../../infrastructure/database/mongodb/repositories/mongo-meal.repository';
import { CloudinaryService } from '../../infrastructure/services/cloudinary.service';
import { MealsController } from './meals.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { UsersModule } from '../users/users.module';
import { UploadMealUseCase } from '../../application/use-cases/meals/upload-meal.usecase';
import { GetMealHistoryUseCase } from '../../application/use-cases/meals/get-meal-history.usecase';
import { GetMealsPaginatedUseCase } from '../../application/use-cases/meals/get-meals-paginated.usecase';
import { GetMealByIdUseCase } from '../../application/use-cases/meals/get-meal-by-id.usecase';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meal.name, schema: MealSchema }]),
    GeminiModule,
    UsersModule,
  ],
  controllers: [MealsController],
  providers: [
    CloudinaryService,
    UploadMealUseCase,
    GetMealHistoryUseCase,
    GetMealsPaginatedUseCase,
    GetMealByIdUseCase,
    {
      provide: 'IMealRepository',
      useClass: MongoMealRepository,
    },
  ],
  exports: [
    'IMealRepository',
    UploadMealUseCase,
    GetMealHistoryUseCase,
    GetMealsPaginatedUseCase,
    GetMealByIdUseCase,
    MongooseModule.forFeature([{ name: Meal.name, schema: MealSchema }]),
  ],
})
export class MealsModule {}
