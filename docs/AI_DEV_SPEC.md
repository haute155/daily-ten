# Daily Ten — AI 개발 지시서 (Development Spec)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v1.0 |
| 최종 수정일 | 2026-07-07 |
| 상태 | Active — 살아있는 문서. 구조·규칙이 바뀌면 코드와 같은 PR에서 이 문서를 갱신한다 |
| 관련 문서 | [제품 기획서 (PRD)](./PRD.md) — 도메인 규칙과 기능 명세의 원본 |

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-07-07 | 초기 AI 지시서를 재구성. MVP 구현 완료 상태를 스냅샷으로 반영 |
| v1.1 | 2026-07-07 | 문서 기준 프로젝트 검증 수행. 도메인 불변식 위반 2건(P0) 등 발견 사항을 백로그에 반영 |
| v1.2 | 2026-07-07 | pnpm+mise 전환. P0 2건·P1 4건 수정 완료(버전 적용 시점, 기록-버전 링크, 하이드레이션 게이트, 빈 상태, 테스트, README). 리포지토리 계층 제거 결정. React Compiler 스토어 getter 규칙 추가 |
| v2.0 | 2026-07-07 | **백엔드 도입**: pnpm 모노레포(frontend/backend), NestJS + Prisma + PostgreSQL(Docker), JWT 인증 직접 구현, 프론트를 localStorage → API 기반으로 전환. 도메인 규칙은 서버가 최종 보장 |

---

## 1. 이 문서의 목적과 사용법

이 문서는 AI(또는 새 개발자)에게 작업을 지시할 때의 **단일 진실 공급원**이다.

**작업 프로토콜:**

1. 작업 시작 전 이 문서와 PRD를 읽는다. 도메인 규칙은 PRD §5, 구현 규칙은 이 문서를 따른다.
2. 문서와 코드가 충돌하면 **코드가 현재 상태의 진실**이다. 단, 발견 즉시 문서를 고치거나 코드가 잘못됐음을 보고한다.
3. 아키텍처·규칙·범위에 영향을 주는 변경은 코드 변경과 **같은 커밋에서** 이 문서(및 필요 시 PRD)를 갱신한다.
4. 새 작업은 §9 백로그에서 가져오고, 완료하면 백로그에서 지운 뒤 §2 스냅샷을 갱신한다.

---

## 2. 현재 구현 상태 스냅샷 (2026-07-07 기준, v2.0)

**Phase 3 완료 — 자체 백엔드 도입.** pnpm 모노레포(frontend/backend). 데이터는 PostgreSQL(Docker)에 저장되고, NestJS API가 JWT 인증과 도메인 규칙을 보장한다. 로그인 필수 모드.

| 영역 | 상태 |
|---|---|
| 6개 페이지 + /login | ✅ 미로그인 시 /login 리다이렉트 (AppGate) |
| 인증 | ✅ 이메일+비밀번호, bcrypt(12r), JWT(7d) 직접 구현. signup/login/me |
| 데이터 API | ✅ GET/POST /versions, GET /entries, PUT /entries/:date (사용자 스코프) |
| 도메인 규칙 서버 보장 | ✅ 가중치 합 10 검증, 점수 서버 재계산(클라 점수 무시), 오늘 기록 시 새 버전 내일부터, 기록-버전 링크 불변, 하루 1엔트리(unique userId+date) |
| 프론트 상태 | ✅ zustand 인메모리 + 서버 fetch (`loadAll`). localStorage에는 JWT 토큰만 |
| 프론트 도메인 로직 | ✅ `frontend/src/lib/domain/` 유지 (실시간 점수 미리보기, diff 요약 생성) + 테스트 22개 |
| mock 데이터 | 제거됨 — 신규 사용자는 빈 상태에서 첫 체크리스트를 직접 구성 |
| DB | ✅ PostgreSQL 17 (docker compose, 포트 5433), Prisma 마이그레이션 |
| e2e 검증 | ✅ 가입→첫 구성→기록→버전변경→재로그인 전 흐름 브라우저 검증 완료 |
| 배포 / PWA / AI 추천 | ❌ 미착수 (Phase 4) |

---

## 3. 기술 스택 (실제 설치 버전 기준)

| 구분 | 선택 | 비고 |
|---|---|---|
| 도구 관리 | **mise** (node 24, pnpm 10), **pnpm workspace** (frontend, backend) | 루트 `package.json`이 공통 스크립트 소유 |
| 프론트 | Next.js **16.1.6** (App Router), React **19.2.3** (Compiler), Tailwind 4, shadcn/ui, zustand 5(인메모리), dayjs, recharts, sonner, vitest | |
| 백엔드 | **NestJS 11**, **Prisma 7** (driver adapter `@prisma/adapter-pg`, `moduleFormat=cjs`), class-validator, `@nestjs/jwt`, bcrypt | `.env`로 설정 분리 (`backend/.env.example`) |
| DB | PostgreSQL 17 — 로컬은 `docker compose up -d` (포트 **5433**) | 스키마 변경은 반드시 `prisma migrate dev`로 |
| 언어 | TypeScript 5 전 영역, `any` 금지 | |

루트 스크립트: `pnpm dev`(둘 다) / `dev:front` / `dev:api` / `build` / `test` / `lint` / `db:up` / `db:down`

**새 라이브러리 추가는 금지가 기본값.** 필요하면 이 표를 갱신하는 결정과 함께 추가한다.

---

## 4. 아키텍처

### 4.1 레이어 구조

```
frontend/src/
├── app/                  # 라우트. 페이지는 얇게 — AppGate로 감싸고 조립만
│   ├── login/            # 이메일+비밀번호 로그인/가입
│   ├── today/ settings/ history/ history/[date]/ stats/ onboarding/
│   └── BottomNavClient.tsx  # /login, /onboarding에서는 숨김
├── components/
│   ├── ui/               # shadcn 프리미티브 (직접 수정 최소화)
│   ├── layout/ shared/   # AppGate(인증+데이터 로드 게이트), ScoreBadge 등
│   └── today/ history/ stats/ settings/
├── hooks/                # 페이지별 뷰 로직
├── store/appStore.ts     # zustand 인메모리 스토어 — 서버 데이터 캐시
└── lib/
    ├── api.ts            # API 클라이언트 (JWT 토큰 관리, 401 → /login)
    ├── types.ts          # 도메인 타입
    └── domain/           # 순수 함수 (점수 미리보기, diff 요약) + __tests__/

backend/src/
├── main.ts               # CORS, 전역 ValidationPipe(whitelist)
├── prisma/               # PrismaService (@Global)
├── auth/                 # signup/login/me, bcrypt, JwtAuthGuard, @CurrentUser
├── versions/             # 버전 목록/생성 — 도메인 규칙 트랜잭션으로 보장
├── entries/              # 기록 목록/upsert — 점수 서버 재계산
└── generated/prisma/     # prisma generate 산출물 (커밋하지 않음)
```

### 4.2 의존 방향 (위반 금지)

```
frontend: app → hooks → store → lib/api → (HTTP) → backend
          lib/domain → 오직 lib/types만 의존 (React·스토어 접근 금지)
backend:  controller → service → PrismaService. 도메인 규칙은 service 계층에
```

### 4.3 데이터 흐름

1. `AppGate`가 토큰 확인(없으면 /login) 후 `loadAll()`로 versions+entries를 서버에서 가져온다. 준비 전에는 스켈레톤
2. 페이지 훅은 구독한 상태에서 도메인 함수로 파생하고, 스토어 액션(`saveTodayEntry`, `updateEntryByDate`, `updateVersion`)을 await 한다
3. 액션은 API를 호출하고 **서버 응답으로** 로컬 상태를 갱신한다 — 서버가 진실의 원천
4. 도메인 규칙(점수 계산, 적용 시점, 링크 불변)은 서버 service가 최종 보장. 프론트 도메인 함수는 즉각적 UI(점수 미리보기, diff 요약)용
5. localStorage에는 JWT 토큰(`daily-ten-token`)만 저장한다

### 4.4 React Compiler 주의 (중요)

**렌더 중에 스토어 getter 함수를 호출하지 않는다.** `const v = useAppStore(s => s.getLatestVersion)` 후 렌더에서 `v()`를 호출하면, React Compiler가 함수 참조(불변) 기준으로 결과를 메모해 상태가 바뀌어도 파생값이 갱신되지 않는다 (실제 stale 버그로 검증됨). 규칙:

- 렌더 파생값: 구독한 상태에서 직접 계산 — `useAppStore(s => s.versions)` → `resolveLatestVersion(versions)`
- 이벤트 핸들러 안: `useAppStore.getState().getTodayEntry()` 사용 가능
- 수동 `useCallback`/`useMemo`는 쓰지 않는다 — React Compiler가 자동 메모이제이션하며, 수동 메모는 `react-hooks/preserve-manual-memoization` lint 에러를 유발한다

---

## 5. 도메인 규칙 구현 명세

PRD §5가 원본. 코드에서 지켜야 할 불변식:

**최종 보장 주체는 백엔드 service 계층이다** (`versions.service.ts`, `entries.service.ts`). 프론트는 같은 규칙을 UX용으로 선반영할 뿐이다.

1. **점수**: 서버가 항상 버전 가중치로 재계산한다. 클라이언트가 보낸 score는 무시된다 (ValidationPipe whitelist).
2. **버전 append-only**: POST /versions는 트랜잭션으로 [최신 버전 effectiveTo 닫기 → versionNumber+1 생성]을 수행한다. 버전 수정 API는 없다.
3. **적용 시점**: 요청의 `clientToday`에 기록이 있으면 `effectiveFrom = clientToday + 1일`. 날짜의 기준은 클라이언트 로컬(타임존은 클라이언트가 안다).
4. **기록-버전 연결**: PUT /entries/:date는 기존 기록이면 그 기록의 버전으로, 새 기록이면 해당 날짜의 활성 버전(effectiveFrom ≤ date 중 최신)으로 점수를 계산한다.
5. **총합 10점**: 서버가 weight 합 ≠ 10이면 400. 프론트도 저장 버튼을 비활성화한다.
6. **날짜**: 문자열 `YYYY-MM-DD`. 하루 1엔트리 — DB unique(userId, date)로 강제.
7. **사용자 스코프**: 모든 쿼리는 JWT의 userId로 필터. 다른 사용자 데이터 접근 불가.

diff 설명 문구는 한국어 문장으로 생성한다 (예: "운동 가중치 2 → 3", "독서 항목 삭제").

---

## 6. 코딩 컨벤션

- 컴포넌트 분리는 명확하되 과도한 추상화 금지. 재사용 2회 미만이면 페이지 소유 디렉토리에 둔다.
- `any` 사용 금지, 타입은 `src/lib/types.ts`에서만 정의·수출.
- 하드코딩 최소화 — 매직 넘버(고득점 기준 8점, 트렌드 임계 ±0.2 등)는 도메인 모듈의 상수로.
- 화려한 애니메이션 금지. 모바일 터치 영역·라벨 등 접근성 기본 준수.
- UI 문구는 한국어, 담백하게. 색상만으로 상태 구분 금지.
- **디자인 토큰** (`frontend/src/app/globals.css` @theme): Primary=블랙(`neutral-900` — CTA·제목·큰 숫자), Accent=`brand`(#007fff — 활성/체크/고득점/차트 데이터 전용, 남용 금지), 부정=`low`(#e5484d — 기준 미달·삭제·초과). 무채색은 `neutral` 스케일만 사용 (slate/indigo/emerald/amber/rose 금지). 라운드는 전역 `--radius: 0.3rem` 기준으로 절제(rounded-md/lg), 파스텔 배경 대신 흰 배경+얇은 테두리. 차트는 데이터 색 #007fff 단일, 그리드는 neutral-200으로 물러나게.
- 백엔드: 입력 검증은 DTO + class-validator로, 비즈니스 규칙은 service에서. 에러 메시지는 한국어로 사용자에게 그대로 보여줄 수 있는 문장으로.
- DB 스키마 변경은 반드시 `prisma migrate dev`로 마이그레이션 파일을 남긴다. `db push` 금지.

---

## 7. UX 구현 규칙 (판단 기준)

- `/today`에 무언가를 추가할 때는 항상 **"10초 룰"** 로 심사한다: 체크→저장 흐름에 단계·모달이 늘면 반려.
- 과거 기록 수정은 의도적으로 한 단계 깊게 유지한다 (캘린더 → 상세 → 수정). 이를 "개선"이라며 단축하지 않는다.
- 저장 성공/완료 상태는 항상 명시적으로 (sonner 토스트 + 화면 상태 전환).

---

## 8. 검증 체크리스트 (작업 완료 전)

- [ ] 루트에서 `pnpm lint` / `pnpm test` / `pnpm build` 통과 (frontend + backend)
- [ ] 도메인 불변식(§5) 위반 없음 — 서버 service 계층 기준으로 확인
- [ ] API를 바꿨으면 curl로 정상/이상 경로(401, 400, 사용자 격리) 확인
- [ ] PRD §8의 예외 상태(데이터 없음, 미로그인, 서버 다운)에서 UI가 깨지지 않음
- [ ] 모바일 뷰포트(375px)에서 확인
- [ ] 아키텍처·규칙이 바뀌었으면 이 문서 갱신, 제품 결정이 바뀌었으면 PRD 갱신

---

## 9. 백로그

우선순위 순. 완료 시 항목을 지우고 §2 스냅샷과 변경 이력을 갱신한다.

### P1 — 다듬기

- [ ] 실사용 dogfooding에서 나온 UX 마찰 지점 반영
- [ ] 인사이트 문구 데이터 부족 처리: 기록 1개일 때 "지난달보다 평균 +7점 향상" 같은 과장 문구가 나옴 (`getInsightSummary`가 prev30 없을 때 개선폭을 그대로 계산). 최소 기록 수 조건 필요
- [ ] 백엔드 단위/e2e 테스트: 현재 Nest 스캐폴드 기본 테스트뿐. versions/entries service의 규칙(적용 시점, 재계산)에 대한 테스트 작성
- [ ] JWT 만료 UX: 만료 시 401 → /login 이동은 되나, 리프레시 토큰 없음 (7일마다 재로그인). 필요해지면 refresh 흐름 도입

### P2 — Phase 4 (배포·확장)

- [ ] 배포: 관리형 Postgres + backend(Railway/Fly) + frontend(Vercel), 환경변수 이관 (JWT_SECRET 교체 필수)
- [ ] PWA (manifest, service worker, 설치 유도)
- [ ] AI 추천 실연동 (현재 placeholder)
- [ ] 정량형 항목 스키마 확장

---

## 10. AI에게 새 작업을 지시할 때의 프롬프트 템플릿

```
docs/PRD.md 와 docs/AI_DEV_SPEC.md 를 먼저 읽어줘.
작업: <작업 내용>
완료 기준: AI_DEV_SPEC §8 체크리스트 통과 + 관련 문서 갱신.
```
