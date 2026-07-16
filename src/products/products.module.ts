import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FirestoreModule } from '../config/firestore.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FirestoreModule, AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
