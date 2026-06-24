import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class OnboardingDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(120)
  age: number;

  @IsNotEmpty()
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @IsNotEmpty()
  @IsNumber()
  @Min(50)
  @Max(300)
  height: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight: number;

  @IsNotEmpty()
  @IsEnum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extra_active',
  ])
  activityLevel:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extra_active';
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsEnum(['male', 'female'])
  gender?: 'male' | 'female';

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number;

  @IsOptional()
  @IsEnum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extra_active',
  ])
  activityLevel?:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extra_active';
}
