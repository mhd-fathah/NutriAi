import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../users/repositories/user.repository.interface';
import { RegisterDto, LoginDto } from '../../common/dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      provider: 'credentials',
      onboardingCompleted: false,
    });

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
      },
    };
  }

  async googleLogin(token: string) {
    try {
      // Validate Google Token using Google's tokeninfo endpoint
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      );

      if (!response.ok) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const googlePayload = await response.json();
      const { email, name, sub: googleId, picture } = googlePayload;

      if (!email) {
        throw new BadRequestException('Google account must have an email address');
      }

      let user = await this.userRepository.findByEmail(email);

      if (!user) {
        // Register new Google user
        user = await this.userRepository.create({
          name: name || 'Google User',
          email,
          googleId,
          provider: 'google',
          image: picture,
          onboardingCompleted: false,
        });
      } else {
        // Update user's googleId and provider if not set
        if (!user.googleId) {
          user = await this.userRepository.update(user._id.toString(), {
            googleId,
            provider: 'google',
            image: user.image || picture,
          });
        }
      }
      
      if (!user) {
        throw new UnauthorizedException('Authentication failed');
      }

      const payload = { sub: user._id.toString(), email: user.email };
      const jwtToken = this.jwtService.sign(payload);

      return {
        token: jwtToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          onboardingCompleted: user.onboardingCompleted,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Google authentication failed',
      );
    }
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      onboardingCompleted: user.onboardingCompleted,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      bmi: user.bmi,
      goal: user.goal,
      dailyCalories: user.dailyCalories,
      dailyProtein: user.dailyProtein,
      dailyCarbs: user.dailyCarbs,
      dailyFat: user.dailyFat,
    };
  }
}
