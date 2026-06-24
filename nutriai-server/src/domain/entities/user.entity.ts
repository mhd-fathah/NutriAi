export class UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  provider?: 'credentials' | 'google';
  image?: string;
  emailVerified?: Date;
  age?: number;
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;
  activityLevel?: string;
  bmi?: number;
  goal?: string;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  onboardingCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
