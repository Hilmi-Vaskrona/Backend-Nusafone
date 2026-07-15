import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll() {
    return this.productsRepository.find({
      relations: ['category'],
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findByCategory(categoryId: number) {
    return this.productsRepository.find({
      where: { categoryId },
      relations: ['category'],
    });
  }

  async create(createProductDto: CreateProductDto, user: any) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can create products');
    }
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto, user: any) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can update products');
    }
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: number, user: any) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can delete products');
    }
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productsRepository.remove(product);
    return { message: 'Product deleted' };
  }
}
