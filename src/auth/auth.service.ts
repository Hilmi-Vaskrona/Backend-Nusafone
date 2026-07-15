import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirestoreService } from '../config/firestore.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly firestoreService: FirestoreService) {}

  async register(registerDto: RegisterDto) {
    const usersRef = this.firestoreService.collection('users');

    const existing = await usersRef
      .where('email', '==', registerDto.email)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new ConflictException('Email already registered');
    }

    const userRecord = await this.firestoreService.auth.createUser({
      email: registerDto.email,
      password: registerDto.password,
      displayName: registerDto.name,
    });

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const userData = {
      id: userRecord.uid,
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || UserRole.USER,
      createdAt: new Date().toISOString(),
    };

    await usersRef.doc(userRecord.uid).set(userData);

    const { password, ...result } = userData;
    return result;
  }

  async login(loginDto: LoginDto) {
    try {
      const userRecord = await this.firestoreService.auth.getUserByEmail(
        loginDto.email,
      );

      const userDoc = await this.firestoreService
        .collection('users')
        .doc(userRecord.uid)
        .get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const userData = userDoc.data()!;
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        userData.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const customToken = await this.firestoreService.auth.createCustomToken(
        userRecord.uid,
      );

      return {
        access_token: customToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async getProfile(userId: string) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = userDoc.data()!;
    return result;
  }
}
