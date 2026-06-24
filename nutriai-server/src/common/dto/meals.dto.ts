import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMealDto {
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
