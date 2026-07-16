import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { FirestoreModule } from '../config/firestore.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FirestoreModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
