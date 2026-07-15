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
    let totalPrice = 0;
    const orderItems: any[] = [];

    for (const item of createOrderDto.items) {
      const productDoc = await this.firestoreService
        .collection('products')
        .doc(item.productId)
        .get();

      if (!productDoc.exists) {
        throw new NotFoundException(`Product with id ${item.productId} not found`);
      }

      const productData = productDoc.data()!;
      if (productData.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${productData.name}`);
      }

      const itemPrice = Number(productData.price) * item.quantity;
      totalPrice += itemPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: productData.price,
      });

      await productDoc.ref.update({
        stock: productData.stock - item.quantity,
      });
    }

    const orderData = {
      userId,
      totalPrice,
      status: 'pending',
      items: orderItems,
      createdAt: new Date().toISOString(),
    };

    const docRef = await this.col.add(orderData);

    const cartSnapshot = await this.firestoreService
      .collection('cart')
      .where('userId', '==', userId)
      .get();

    const batch = this.firestoreService.database.batch();
    cartSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return { id: docRef.id, ...orderData };
  }

  async findAllByUser(userId: string) {
    const snapshot = await this.col
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const orders: any[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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

    return { id: doc.id, ...orderData };
  }
}
