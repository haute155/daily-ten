# Daily Ten

매일의 행동을 10점 만점 점수로 기록하고, 그 점수 체계 자체를 직접 설계·버전 관리·개선해 나가는 자기관리 플랫폼.

> 시스템 설계 → 실행 → 기록 → 분석 → 개선 → 재설계

- **Win small, win daily** — 매일의 작은 승리를 기록한다
- **의지보다 시스템, 기억보다 기록**
- 점수 기준(항목·가중치)의 모든 변경이 **버전 이력**으로 남는다

## 구조 (pnpm 모노레포)

```
daily-ten/
├── frontend/          # Next.js 16 (App Router) — 모바일 우선 UI
├── backend/           # NestJS — 인증(JWT) + 데이터 API
│   └── prisma/        # DB 스키마 + 마이그레이션
├── docker-compose.yml # PostgreSQL 17 (로컬 개발용)
└── docs/              # PRD, AI 개발 지시서 (살아있는 문서)
```

## 실행 방법

[mise](https://mise.jdx.dev)로 도구 버전을 관리합니다 (`mise.toml`: node 24, pnpm 10). Docker가 필요합니다.

```bash
mise install                # node + pnpm
pnpm install                # 전체 워크스페이스 의존성
pnpm db:up                  # PostgreSQL 컨테이너 기동
cd backend && cp .env.example .env && pnpm exec prisma migrate dev && cd ..
pnpm dev                    # frontend(:3000) + backend(:4000) 동시 실행
```

개별 실행: `pnpm dev:front` / `pnpm dev:api`

```bash
pnpm test        # 전체 테스트
pnpm lint        # 전체 lint
pnpm build       # 전체 빌드
```

## 기술 스택

| 영역 | 스택 |
|---|---|
| 프론트 | Next.js 16, React 19 (Compiler), TypeScript, Tailwind 4, shadcn/ui, zustand, recharts, vitest |
| 백엔드 | NestJS 11, Prisma 7, PostgreSQL 17 (Docker), JWT + bcrypt 직접 구현 |
| 도구 | pnpm workspace, mise |

## API 개요

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /auth/signup, /auth/login | 이메일+비밀번호 가입/로그인 → JWT |
| GET | /auth/me | 토큰 검증 + 내 정보 |
| GET/POST | /versions | 체크리스트 버전 목록 / 새 버전 생성 |
| GET | /entries | 날짜별 기록 목록 |
| GET/POST/PATCH/DELETE | /categories | 사용자 정의 카테고리 CRUD |
| PUT | /entries/:date | 해당 날짜 기록 생성·수정 (upsert) |

도메인 규칙(가중치 합 10점, 버전 append-only, 오늘 기록 시 변경은 내일부터, 점수 서버 재계산)은 **서버가 최종 보장**합니다. 상세 규칙과 아키텍처는 `docs/AI_DEV_SPEC.md`, 제품 기획은 `docs/PRD.md` 참고.

## 배포 방향 (Phase 4)

코드는 그대로 두고 환경변수만 교체: DB → 관리형 Postgres(Neon/RDS 등), backend → Railway/Fly.io, frontend → Vercel. `backend/.env.example` 참고.
