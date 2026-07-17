import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(String(user.id), createOrderDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.ordersService.findAllByUser(String(user.id));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(id, String(user.id));
  }

  @Get(':id/receipt')
  getReceipt(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.getReceipt(id, String(user.id));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateStatus(id, dto, user.role);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.cancel(id, String(user.id));
  }
}
