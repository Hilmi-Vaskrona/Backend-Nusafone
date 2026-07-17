import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FirestoreService } from '../config/firestore.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  private readonly COLLECTION = 'orders';

  private readonly VALID_STATUSES = [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

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

    const userDoc = await this.firestoreService
      .collection('users')
      .doc(String(userId))
      .get();

    const userData = userDoc.exists ? userDoc.data()! : {};

    let totalPrice = 0;
    const orderItems: any[] = [];

    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();
      const productId = cartData.productId;
      const quantity = cartData.quantity;

      const productDoc = await this.firestoreService
        .collection('products')
        .doc(String(productId))
        .get();

      if (!productDoc.exists) {
        throw new NotFoundException(`Product with id ${productId} not found`);
      }

      const productData = productDoc.data()!;
      if (productData.stock < quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${productData.name}`,
        );
      }

      const itemPrice = Number(productData.price) * quantity;
      totalPrice += itemPrice;

      orderItems.push({
        productId,
        productName: productData.name,
        productImage: productData.imageUrl || '',
        quantity,
        price: productData.price,
        subtotal: itemPrice,
      });

      await productDoc.ref.update({
        stock: productData.stock - quantity,
      });
    }

    const id = await this.firestoreService.getNextId(this.COLLECTION);
    const orderData = {
      userId,
      userName: userData.name || '',
      userEmail: userData.email || '',
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
    const snapshot = await this.col.where('userId', '==', userId).get();

    const orders: any[] = snapshot.docs.map((doc) => ({
      id: Number(doc.id),
      ...doc.data(),
    }));

    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return orders;
  }

  async findOne(id: string, userId: string) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return { id: Number(doc.id), ...doc.data() };
  }

  async getReceipt(id: string, userId: string) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const order = doc.data()!;

    const items = order.items.map((item: any) => ({
      name: item.productName,
      image: item.productImage,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    return {
      receipt: {
        orderId: Number(doc.id),
        storeName: 'Nusafone Electronic Store',
        date: order.createdAt,
        customer: {
          name: order.userName,
          email: order.userEmail,
          address: order.address,
        },
        items,
        note: order.note,
        totalPrice: order.totalPrice,
        status: order.status,
      },
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admin can update order status');
    }

    const doc = await this.col.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Order not found');
    }

    const currentStatus = doc.data()!.status;

    if (currentStatus === 'cancelled') {
      throw new BadRequestException('Cannot update cancelled order');
    }

    if (currentStatus === 'delivered') {
      throw new BadRequestException('Cannot update delivered order');
    }

    if (!this.VALID_STATUSES.includes(dto.status)) {
      throw new BadRequestException('Invalid status');
    }

    await this.col.doc(id).update({ status: dto.status });
    const updated = await this.col.doc(id).get();

    return { id: Number(updated.id), ...updated.data() };
  }

  async cancel(id: string, userId: string) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists || doc.data()!.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const order = doc.data()!;

    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    for (const item of order.items) {
      const productDoc = await this.firestoreService
        .collection('products')
        .doc(String(item.productId))
        .get();

      if (productDoc.exists) {
        const productData = productDoc.data()!;
        await productDoc.ref.update({
          stock: productData.stock + item.quantity,
        });
      }
    }

    await this.col.doc(id).update({ status: 'cancelled' });
    const updated = await this.col.doc(id).get();

    return { id: Number(updated.id), ...updated.data() };
  }
}
