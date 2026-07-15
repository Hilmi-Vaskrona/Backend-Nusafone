import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirestoreService } from '../config/firestore.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly COLLECTION = 'products';

  constructor(private readonly firestoreService: FirestoreService) {}

  private get col() {
    return this.firestoreService.collection(this.COLLECTION);
  }

  async findAll() {
    const snapshot = await this.col.get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const categoriesSnapshot = await this.firestoreService
      .collection('categories')
      .get();
    const categoriesMap = new Map<string, any>();
    categoriesSnapshot.docs.forEach((doc) => {
      categoriesMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return products.map((product: any) => ({
      ...product,
      category: categoriesMap.get(product.categoryId) || null,
    }));
  }

  async findOne(id: string) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Product not found');
    }

    const productData = doc.data()!;
    let category: any = null;
    if (productData.categoryId) {
      const catDoc = await this.firestoreService
        .collection('categories')
        .doc(productData.categoryId)
        .get();
      if (catDoc.exists) {
        category = { id: catDoc.id, ...catDoc.data() };
      }
    }

    return { id: doc.id, ...productData, category };
  }

  async findByCategory(categoryId: string) {
    const snapshot = await this.col
      .where('categoryId', '==', categoryId)
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const catDoc = await this.firestoreService
      .collection('categories')
      .doc(categoryId)
      .get();

    const category = catDoc.exists
      ? { id: catDoc.id, ...catDoc.data() }
      : null;

    return products.map((product: any) => ({
      ...product,
      category,
    }));
  }

  async create(createProductDto: CreateProductDto, user: any) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(user.id)
      .get();

    if (!userDoc.exists || userDoc.data()!.role !== 'admin') {
      throw new ForbiddenException('Only admin can create products');
    }

    const docRef = await this.col.add({
      ...createProductDto,
      stock: createProductDto.stock || 0,
      createdAt: new Date().toISOString(),
    });

    return { id: docRef.id, ...createProductDto };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: any) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(user.id)
      .get();

    if (!userDoc.exists || userDoc.data()!.role !== 'admin') {
      throw new ForbiddenException('Only admin can update products');
    }

    const doc = await this.col.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Product not found');
    }

    await this.col.doc(id).update(updateProductDto);
    const updated = await this.col.doc(id).get();

    return { id: updated.id, ...updated.data() };
  }

  async remove(id: string, user: any) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(user.id)
      .get();

    if (!userDoc.exists || userDoc.data()!.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete products');
    }

    const doc = await this.col.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Product not found');
    }

    await this.col.doc(id).delete();
    return { message: 'Product deleted' };
  }
}
