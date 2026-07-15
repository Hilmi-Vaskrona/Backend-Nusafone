import { Injectable, NotFoundException } from '@nestjs/common';
import { FirestoreService } from '../config/firestore.service';

@Injectable()
export class UsersService {
  constructor(private readonly firestoreService: FirestoreService) {}

  async getProfile(userId: string) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = userDoc.data()!;
    return result;
  }
}
