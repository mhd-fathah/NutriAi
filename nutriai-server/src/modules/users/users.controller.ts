import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingDto, UpdateProfileDto } from '../../common/dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompleteOnboardingUseCase } from '../../application/use-cases/users/complete-onboarding.usecase';
import { GetUserProfileUseCase } from '../../application/use-cases/users/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from '../../application/use-cases/users/update-user-profile.usecase';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Post('onboarding')
  async completeOnboarding(@Request() req, @Body() onboardingDto: OnboardingDto) {
    return this.completeOnboardingUseCase.execute(req.user.id, onboardingDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.getUserProfileUseCase.execute(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.updateUserProfileUseCase.execute(req.user.id, updateProfileDto);
  }
}
