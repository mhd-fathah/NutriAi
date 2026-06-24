import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { RegisterDto, LoginDto, GoogleLoginDto } from '../../common/dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.usecase';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.usecase';
import { GoogleLoginUseCase } from '../../application/use-cases/auth/google-login.usecase';
import { GetUserProfileUseCase } from '../../application/use-cases/users/get-user-profile.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.registerUserUseCase.execute(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.loginUserUseCase.execute(loginDto);
  }

  @Post('google')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.googleLoginUseCase.execute(googleLoginDto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.getUserProfileUseCase.execute(req.user.id);
  }
}
