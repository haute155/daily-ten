import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './auth.service';

/** Authorization: Bearer <token> 을 검증하고 request.user에 페이로드를 싣는다 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('로그인이 필요합니다');
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      (request as Request & { user: JwtPayload }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException(
        '세션이 만료됐습니다. 다시 로그인해 주세요',
      );
    }
  }
}
