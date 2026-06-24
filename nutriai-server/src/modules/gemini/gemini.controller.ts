import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AnalyzeFoodDto } from '../../common/dto/gemini.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('analyze')
  async analyzeFood(@Body() analyzeFoodDto: AnalyzeFoodDto) {
    return this.geminiService.analyzeFood(
      analyzeFoodDto.imageBase64,
      analyzeFoodDto.mimeType || 'image/jpeg',
    );
  }
}
