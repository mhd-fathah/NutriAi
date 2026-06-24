import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { OnboardingDto, UpdateProfileDto } from '../../common/dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('onboarding')
  async completeOnboarding(@Request() req, @Body() onboardingDto: OnboardingDto) {
    return this.usersService.completeOnboarding(req.user.id, onboardingDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }
}
