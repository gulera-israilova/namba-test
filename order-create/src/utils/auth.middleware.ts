import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtTokenService: JwtService) {}

  async use(req: any, res: any, next: () => void) {
    const authorization = req.headers.authorization; // Используем стандартный способ доступа к заголовкам
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authorization.split(' ')[1]; // Ожидается, что токен будет в формате "Bearer <token>"
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      req.user = this.jwtTokenService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Unauthorized');
    }

    next();
  }
}
