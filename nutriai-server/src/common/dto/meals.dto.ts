import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class AnalyzeMealDto {
  @IsNotEmpty()
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snacks'])
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';

  @IsNotEmpty()
  @IsString()
  imageBase64: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class SaveMealDto {
  @IsNotEmpty()
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snacks'])
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsString()
  foodName: string;

  @IsNotEmpty()
  @IsString()
  estimatedWeight: string;

  @IsNotEmpty()
  @IsNumber()
  calories: number;

  @IsNotEmpty()
  @IsNumber()
  protein: number;

  @IsNotEmpty()
  @IsNumber()
  carbs: number;

  @IsNotEmpty()
  @IsNumber()
  fat: number;

  @IsOptional()
  @IsNumber()
  sugar?: number;

  @IsOptional()
  @IsNumber()
  fiber?: number;

  @IsOptional()
  @IsNumber()
  sodium?: number;

  @IsNotEmpty()
  @IsArray()
  foods: any[];

  @IsNotEmpty()
  @IsNumber()
  confidence: number;

  @IsNotEmpty()
  @IsArray()
  aiTips: string[];

  @IsNotEmpty()
  @IsBoolean()
  isEstimated: boolean;

  @IsNotEmpty()
  @IsString()
  aiStatus: 'success' | 'fallback';

  @IsNotEmpty()
  @IsString()
  aiProvider: 'gemini' | 'local' | 'fallback';

  @IsOptional()
  @IsString()
  imageHash?: string;

  @IsOptional()
  @IsString()
  analysisVersion?: string;
}
