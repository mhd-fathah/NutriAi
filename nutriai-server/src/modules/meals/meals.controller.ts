import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AnalyzeMealDto, SaveMealDto } from '../../common/dto/meals.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyzeMealUseCase } from '../../application/use-cases/meals/analyze-meal.usecase';
import { SaveMealUseCase } from '../../application/use-cases/meals/save-meal.usecase';
import { GetMealHistoryUseCase } from '../../application/use-cases/meals/get-meal-history.usecase';
import { GetMealsPaginatedUseCase } from '../../application/use-cases/meals/get-meals-paginated.usecase';
import { GetMealByIdUseCase } from '../../application/use-cases/meals/get-meal-by-id.usecase';

@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(
    private readonly analyzeMealUseCase: AnalyzeMealUseCase,
    private readonly saveMealUseCase: SaveMealUseCase,
    private readonly getMealHistoryUseCase: GetMealHistoryUseCase,
    private readonly getMealsPaginatedUseCase: GetMealsPaginatedUseCase,
    private readonly getMealByIdUseCase: GetMealByIdUseCase,
  ) {}

  @Post('analyze')
  async analyzeMeal(@Request() req, @Body() analyzeMealDto: AnalyzeMealDto) {
    return this.analyzeMealUseCase.execute(req.user.id, analyzeMealDto);
  }

  @Post()
  async createMeal(@Request() req, @Body() saveMealDto: SaveMealDto) {
    return this.saveMealUseCase.execute(req.user.id, saveMealDto);
  }

  @Get('history')
  async getHistory(
    @Request() req,
    @Query('range') range: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    return this.getMealHistoryUseCase.execute(req.user.id, range);
  }

  @Get()
  async getMealsPaginated(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.getMealsPaginatedUseCase.execute(req.user.id, limit, page);
  }

  @Get(':id')
  async getMealById(@Param('id') id: string) {
    return this.getMealByIdUseCase.execute(id);
  }
}
