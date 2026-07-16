import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirestoreService } from '../config/firestore.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly COLLECTION = 'orders';

  constructor(private readonly firestoreService: FirestoreService) {}

  private get col() {
    return this.firestoreService.collection(this.COLLECTION);
  }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const cartSnapshot = await this.firestoreService
      .collection('cart')
      .where('userId', '==', userId)
      .get();

    if (cartSnapshot.empty) {
      throw new BadRequestException('Cart is empty');
    }

    let totalPrice = 0;
    const orderItems: any[] = [];

    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();
      const productId = cartData.productId;
      const quantity = cartData.quantity;

      const productDoc = await this.firestoreService
        .collection('products')
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        throw new NotFoundException(`Product with id ${productId} not found`);
      }

      const productData = productDoc.data()!;
      if (productData.stock < quantity) {
        throw new BadRequestException(`Insufficient stock for product ${productData.name}`);
      }

      const itemPrice = Number(productData.price) * quantity;
      totalPrice += itemPrice;

      orderItems.push({
        productId,
        quantity,
        price: productData.price,
      });

      await productDoc.ref.update({
        stock: productData.stock - quantity,
      });
    }

    const id = await this.firestoreService.getNextId(this.COLLECTION);
    const orderData = {
      userId,
      address: createOrderDto.address,
      note: createOrderDto.note || '',
      totalPrice,
      status: 'pending',
      items: orderItems,
      createdAt: new Date().toISOString(),
    };

    await this.col.doc(String(id)).set(orderData);

    const batch = this.firestoreService.database.batch();
    cartSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return { id, ...orderData };
  }

  async findAllByUser(userId: string) {
    const snapshot = await this.col
      .where('userId', '==', userId)
      .get();

    const orders: any[] = snapshot.docs.map((doc) => ({
      id: Number(doc.id),
      ...doc.data(),
    }));

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const order of orders) {
      if (order.items && order.items.length > 0) {
        const itemsWithProduct: any[] = [];
        for (const item of order.items) {
          const productDoc = await this.firestoreService
            .collection('products')
            .doc(item.productId)
            .get();
          itemsWithProduct.push({
            ...item,
            product: productDoc.exists
              ? { id: productDoc.id, ...productDoc.data() }
              : null,
          });
        }
        order.items = itemsWithProduct;
      }
    }

    return orders;
  }

  async findOne(id: string, userId: string) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const orderData: any = doc.data()!;

    if (orderData.items && orderData.items.length > 0) {
      const itemsWithProduct: any[] = [];
      for (const item of orderData.items) {
        const productDoc = await this.firestoreService
          .collection('products')
          .doc(item.productId)
          .get();
        itemsWithProduct.push({
          ...item,
          product: productDoc.exists
            ? { id: productDoc.id, ...productDoc.data() }
            : null,
        });
      }
      orderData.items = itemsWithProduct;
    }

    return { id: Number(doc.id), ...orderData };
  }
}
