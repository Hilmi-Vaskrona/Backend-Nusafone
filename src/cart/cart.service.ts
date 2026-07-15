import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAllByUser(userId: string) {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
    });
  }

  async create(userId: string, createCartDto: CreateCartDto) {
    const product = await this.productRepository.findOne({
      where: { id: createCartDto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < createCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const existingCart = await this.cartRepository.findOne({
      where: { userId, productId: createCartDto.productId },
    });

    if (existingCart) {
      existingCart.quantity += createCartDto.quantity;
      return this.cartRepository.save(existingCart);
    }

    const cart = this.cartRepository.create({
      userId,
      productId: createCartDto.productId,
      quantity: createCartDto.quantity,
    });
    return this.cartRepository.save(cart);
  }

  async update(id: number, userId: string, updateCartDto: UpdateCartDto) {
    const cart = await this.cartRepository.findOne({
      where: { id, userId },
      relations: ['product'],
    });
    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateCartDto.quantity) {
      if (cart.product.stock < updateCartDto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      cart.quantity = updateCartDto.quantity;
    }

    return this.cartRepository.save(cart);
  }

  async remove(id: number, userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { id, userId },
    });
    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartRepository.remove(cart);
    return { message: 'Cart item deleted' };
  }
}
