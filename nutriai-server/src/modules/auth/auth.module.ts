import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.usecase';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.usecase';
import { GoogleLoginUseCase } from '../../application/use-cases/auth/google-login.usecase';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'nutriai_jwt_secret_key',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    GoogleLoginUseCase,
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
