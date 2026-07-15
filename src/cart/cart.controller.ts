import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart items' })
  findAll(@CurrentUser() user: any) {
    return this.cartService.findAllByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  create(@CurrentUser() user: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.create(user.id, createCartDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.update(id, user.id, updateCartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.cartService.remove(id, user.id);
  }
}
