import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirestoreService } from '../../config/firestore.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firestoreService: FirestoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firestoreService.auth.verifyIdToken(token);
      request.user = {
        id: decodedToken.uid,
        email: decodedToken.email,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
