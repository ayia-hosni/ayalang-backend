import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.usersService.create(email, passwordHash);
    return this.buildAuthResponse(
      user.id,
      user.email,
      user.displayName,
      user.totalXP,
    );
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(
      user.id,
      user.email,
      user.displayName,
      user.totalXP,
    );
  }

  private buildAuthResponse(
    id: string,
    email: string,
    displayName: string,
    totalXP: number,
  ) {
    const accessToken = this.jwtService.sign({ sub: id, email });
    return { accessToken, user: { id, email, displayName, totalXP } };
  }
}
