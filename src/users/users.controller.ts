import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    const user = await this.usersService.findById(userId);
    return {
      id: user!.id,
      email: user!.email,
      displayName: user!.displayName,
      totalXP: user!.totalXP,
    };
  }
}
