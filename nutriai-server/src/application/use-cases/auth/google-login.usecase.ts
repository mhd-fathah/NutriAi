import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(token: string) {
    try {
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
        user = await this.userRepository.create({
          name: name || 'Google User',
          email,
          googleId,
          provider: 'google',
          image: picture,
          onboardingCompleted: false,
        });
      } else {
        if (!user.googleId) {
          user = await this.userRepository.update(user.id, {
            googleId,
            provider: 'google',
            image: user.image || picture,
          });
        }
      }

      if (!user) {
        throw new UnauthorizedException('Authentication failed');
      }

      const payload = { sub: user.id, email: user.email };
      const jwtToken = this.jwtService.sign(payload);

      return {
        token: jwtToken,
        user: {
          id: user.id,
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
}
