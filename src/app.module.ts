import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { FirestoreModule } from './config/firestore.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirestoreModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule {}
