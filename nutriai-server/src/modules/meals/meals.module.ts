import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Meal, MealSchema } from './schemas/meal.schema';
import { MealRepository } from './repositories/meal.repository';
import { CloudinaryService } from './cloudinary.service';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meal.name, schema: MealSchema }]),
    GeminiModule,
    UsersModule,
  ],
  controllers: [MealsController],
  providers: [
    MealsService,
    CloudinaryService,
    {
      provide: 'IMealRepository',
      useClass: MealRepository,
    },
  ],
  exports: [
    'IMealRepository',
    MealsService,
    MongooseModule.forFeature([{ name: Meal.name, schema: MealSchema }]),
  ],
})
export class MealsModule {}
