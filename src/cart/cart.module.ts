import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { FirestoreModule } from '../config/firestore.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FirestoreModule, AuthModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
