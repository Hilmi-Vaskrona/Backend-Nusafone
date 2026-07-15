import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(FirebaseAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.ordersService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(id, user.id);
  }
}
