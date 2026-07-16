import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { FirestoreModule } from '../config/firestore.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FirestoreModule, AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
