import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './auth.service';

/** JwtAuthGuard가 실어둔 사용자 페이로드를 컨트롤러 파라미터로 꺼낸다 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
