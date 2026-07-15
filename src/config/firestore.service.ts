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
}
