import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirestoreService } from '../config/firestore.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    const usersRef = this.firestoreService.collection('users');

    const existing = await usersRef
      .where('email', '==', registerDto.email)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new ConflictException('Email already registered');
    }

    const id = await this.firestoreService.getNextId('users');
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const userData = {
      id,
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || UserRole.USER,
      createdAt: new Date().toISOString(),
    };

    await usersRef.doc(String(id)).set(userData);

    const { password, ...result } = userData;
    return result;
  }

  async login(loginDto: LoginDto) {
    const usersRef = this.firestoreService.collection('users');
    const snapshot = await usersRef
      .where('email', '==', loginDto.email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      userData.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: userData.id, email: userData.email, role: userData.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  async getProfile(userId: number) {
    const userDoc = await this.firestoreService
      .collection('users')
      .doc(String(userId))
      .get();

    if (!userDoc.exists) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = userDoc.data()!;
    return result;
  }
}
