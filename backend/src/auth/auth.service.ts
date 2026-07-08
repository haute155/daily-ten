import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupDto } from './dto/auth.dto';

const BCRYPT_ROUNDS = 12;

/** 가입 시 심어주는 기본 카테고리 — 시드일 뿐, 이후엔 자유롭게 수정·삭제 가능 */
const SEED_CATEGORIES = ['운동', '수면', '학습', '힐링', '식습관', '업무'];

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        categories: {
          createMany: { data: SEED_CATEGORIES.map((label) => ({ label })) },
        },
      },
    });

    return this.issueToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // 사용자 없음과 비밀번호 불일치를 같은 메시지로 — 가입 여부 노출 방지
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    return this.issueToken(user.id, user.email);
  }

  private issueToken(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: userId, email },
    };
  }
}
