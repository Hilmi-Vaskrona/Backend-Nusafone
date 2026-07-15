import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirestoreService } from '../config/firestore.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly COLLECTION = 'categories';

  constructor(private readonly firestoreService: FirestoreService) {}

  private get col() {
    return this.firestoreService.collection(this.COLLECTION);
  }

  async findAll() {
    const snapshot = await this.col.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Category not found');
    }

    const productsSnapshot = await this.firestoreService
      .collection('products')
      .where('categoryId', '==', id)
      .get();

    const products = productsSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return { id: doc.id, ...doc.data(), products };
  }

  async create(createCategoryDto: CreateCategoryDto, user: any) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(user.id)
      .get();

    if (!userDoc.exists || userDoc.data()!.role !== 'admin') {
      throw new ForbiddenException('Only admin can create categories');
    }

    const docRef = await this.col.add({
      ...createCategoryDto,
      createdAt: new Date().toISOString(),
    });

    return { id: docRef.id, ...createCategoryDto };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: any) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(user.id)
      .get();

    if (!userDoc.exists || userDoc.data()!.role !== 'admin') {
      throw new ForbiddenException('Only admin can update categories');
    }

    const doc = await this.col.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Category not found');
    }

    await this.col.doc(id).update(updateCategoryDto);
    const updated = await this.col.doc(id).get();

    return { id: updated.id, ...updated.data() };
  }

  async remove(id: string, user: any) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(user.id)
      .get();

    if (!userDoc.exists || userDoc.data()!.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete categories');
    }

    const doc = await this.col.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Category not found');
    }

    await this.col.doc(id).delete();
    return { message: 'Category deleted' };
  }
}
