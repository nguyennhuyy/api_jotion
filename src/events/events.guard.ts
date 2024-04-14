import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type RequestGuard = Request & {
  handshake: {
    auth: {
      authorization: string;
    };
    user: {
      email: string;
      id: string;
      iat: number;
    };
  };
};
@Injectable()
export class EventsGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: RequestGuard): string | undefined {
    const [type, token] =
      request?.handshake.auth.authorization?.split(' ') ?? null;

    return type === 'Bearer' ? token : undefined;
  }
}
