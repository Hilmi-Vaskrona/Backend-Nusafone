import { Injectable, OnModuleInit } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';
import { initializeFirebase, getFirestoreInstance, getAuthInstance } from './firebase.config';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private db: Firestore;
  private authAdmin: Auth;

  onModuleInit() {
    initializeFirebase();
    this.db = getFirestoreInstance();
    this.authAdmin = getAuthInstance();
  }

  get database(): Firestore {
    return this.db;
  }

  get auth(): Auth {
    return this.authAdmin;
  }

  collection(name: string) {
    return this.db.collection(name);
  }

  async getNextId(collectionName: string): Promise<number> {
    const counterRef = this.db.collection('counters').doc(collectionName);
    const next = await this.db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      const current = doc.exists ? doc.data()!.value : 0;
      const value = current + 1;
      transaction.set(counterRef, { value });
      return value;
    });
    return next;
  }
}
