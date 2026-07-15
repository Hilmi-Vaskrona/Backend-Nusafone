import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser() user: any) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.remove(id, user);
  }
}
