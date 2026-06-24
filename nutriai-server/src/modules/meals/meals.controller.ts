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
import { MealsService } from './meals.service';
import { CreateMealDto } from '../../common/dto/meals.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  async createMeal(@Request() req, @Body() createMealDto: CreateMealDto) {
    return this.mealsService.createMeal(req.user.id, createMealDto);
  }

  @Get('history')
  async getHistory(
    @Request() req,
    @Query('range') range: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    return this.mealsService.getMealsHistory(req.user.id, range);
  }

  @Get()
  async getMealsPaginated(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.mealsService.getMealsPaginated(req.user.id, limit, page);
  }

  @Get(':id')
  async getMealById(@Param('id') id: string) {
    return this.mealsService.getMealById(id);
  }
}
