import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FirestoreModule } from '../config/firestore.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FirestoreModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
