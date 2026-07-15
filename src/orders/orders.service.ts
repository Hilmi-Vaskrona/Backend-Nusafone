import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { Cart } from '../cart/cart.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    let totalPrice = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with id ${item.productId} not found`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }

      const itemPrice = Number(product.price) * item.quantity;
      totalPrice += itemPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      product.stock -= item.quantity;
      await this.productRepository.save(product);
    }

    const order = this.ordersRepository.create({
      userId,
      totalPrice,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.ordersRepository.save(order);

    for (const item of orderItems) {
      const orderItem = this.orderItemsRepository.create({
        ...item,
        orderId: savedOrder.id,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    await this.cartRepository.delete({ userId });

    return this.ordersRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['orderItems', 'orderItems.product'],
    });
  }

  async findAllByUser(userId: string) {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id, userId },
      relations: ['orderItems', 'orderItems.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
