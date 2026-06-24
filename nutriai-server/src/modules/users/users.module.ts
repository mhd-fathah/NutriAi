import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../infrastructure/database/mongodb/schemas/user.schema';
import { MongoUserRepository } from '../../infrastructure/database/mongodb/repositories/mongo-user.repository';
import { UsersController } from './users.controller';
import { NutritionGoalService } from '../../domain/services/nutrition-goal.service';
import { CompleteOnboardingUseCase } from '../../application/use-cases/users/complete-onboarding.usecase';
import { GetUserProfileUseCase } from '../../application/use-cases/users/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from '../../application/use-cases/users/update-user-profile.usecase';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    NutritionGoalService,
    CompleteOnboardingUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
  ],
  exports: [
    'IUserRepository',
    CompleteOnboardingUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UsersModule {}
