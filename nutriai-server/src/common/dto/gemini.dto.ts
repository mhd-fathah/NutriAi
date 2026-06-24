import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnalyzeFoodDto {
  @IsNotEmpty()
  @IsString()
  imageBase64: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
