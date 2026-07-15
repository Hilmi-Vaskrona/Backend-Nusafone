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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(FirebaseAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.cartService.findAllByUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.create(user.id, createCartDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.update(id, user.id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cartService.remove(id, user.id);
  }
}
