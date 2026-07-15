import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirestoreService } from '../config/firestore.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  private readonly COLLECTION = 'cart';

  constructor(private readonly firestoreService: FirestoreService) {}

  private get col() {
    return this.firestoreService.collection(this.COLLECTION);
  }

  async findAllByUser(userId: string) {
    const snapshot = await this.col.where('userId', '==', userId).get();
    const cartItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const productIds: string[] = [...new Set(cartItems.map((item: any) => item.productId))];
    const productsMap = new Map<string, any>();

    for (const productId of productIds) {
      const productDoc = await this.firestoreService
        .collection('products')
        .doc(productId)
        .get();
      if (productDoc.exists) {
        productsMap.set(productId, { id: productDoc.id, ...productDoc.data() });
      }
    }

    return cartItems.map((item: any) => ({
      ...item,
      product: productsMap.get(item.productId) || null,
    }));
  }

  async create(userId: string, createCartDto: CreateCartDto) {
    const productDoc = await this.firestoreService
      .collection('products')
      .doc(createCartDto.productId)
      .get();

    if (!productDoc.exists) {
      throw new NotFoundException('Product not found');
    }

    const productData = productDoc.data()!;
    if (productData.stock < createCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const existing = await this.col
      .where('userId', '==', userId)
      .where('productId', '==', createCartDto.productId)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      const newQuantity = doc.data().quantity + createCartDto.quantity;
      if (productData.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock');
      }
      await doc.ref.update({ quantity: newQuantity });
      return { id: doc.id, userId, productId: createCartDto.productId, quantity: newQuantity };
    }

    const docRef = await this.col.add({
      userId,
      productId: createCartDto.productId,
      quantity: createCartDto.quantity,
    });

    return {
      id: docRef.id,
      userId,
      productId: createCartDto.productId,
      quantity: createCartDto.quantity,
    };
  }

  async update(id: string, userId: string, updateCartDto: UpdateCartDto) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateCartDto.quantity) {
      const productDoc = await this.firestoreService
        .collection('products')
        .doc(doc.data()!.productId)
        .get();

      if (productDoc.exists && productDoc.data()!.stock < updateCartDto.quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      await doc.ref.update({ quantity: updateCartDto.quantity });
    }

    const updated = await this.col.doc(id).get();
    return { id: updated.id, ...updated.data() };
  }

  async remove(id: string, userId: string) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await doc.ref.delete();
    return { message: 'Cart item deleted' };
  }
}
