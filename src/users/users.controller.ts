import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }
}
