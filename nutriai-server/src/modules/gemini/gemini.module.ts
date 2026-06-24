import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { GeminiFoodAnalysisProvider } from '../../infrastructure/services/gemini-food-analysis.provider';

@Module({
  controllers: [GeminiController],
  providers: [
    GeminiService,
    {
      provide: 'IFoodAnalysisProvider',
      useClass: GeminiFoodAnalysisProvider,
    },
  ],
  exports: [GeminiService, 'IFoodAnalysisProvider'],
})
export class GeminiModule {}
