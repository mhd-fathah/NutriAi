import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: { name: string; email: string; password?: string }) {
    const { name, email, password } = data;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('An account with this email already exists');
    }

    let hashedPassword = '';
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword || undefined,
      provider: 'credentials',
      onboardingCompleted: false,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
