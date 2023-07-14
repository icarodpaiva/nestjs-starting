import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  private issuer = 'login';
  private audience = 'users';

  async createToken({ id, name, email }: User) {
    return {
      accessToken: this.jwtService.sign(
        { id, name, email },
        {
          subject: `${id}`,
          expiresIn: '7 days',
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }

  async checkToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        issuer: this.issuer,
        audience: this.audience,
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create({ ...data, name: '' });

    return this.createToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, password },
    });

    if (!user) {
      throw new UnauthorizedException('Email e/ou senha incorretos.');
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email está incorreto.');
    }

    // TO-DO: Send email...
    return true;
  }

  async reset(password: string, token: string) {
    // TO-DO: get id from token
    const id = 3;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        password,
      },
    });

    return this.createToken(user);
  }
}
