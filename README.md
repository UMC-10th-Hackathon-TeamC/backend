## Environment

| Item | Version |
|---|---|
| Node.js | v24.12.0 |
| npm | 11.6.2 |
| Language | TypeScript |
| Framework | Express |
| Database | MySQL |
| ORM | Prisma |

### Version Check

```bash
node -v
# v24.12.0

npm -v
# 11.6.2
```

## Git Branch Convention

### 브랜치 구조

본 프로젝트는 `develop` 브랜치를 최종 개발 브랜치로 사용합니다.

```bash
develop
└── develop-test
    ├── feature/login
    ├── feature/map
    ├── feature/ranking
    ├── feature/community
    └── feature/deploy
```

### 브랜치 역할

| 브랜치            | 역할               |
| -------------- | ---------------- |
| `develop`      | 최종 통합 브랜치        |
| `develop-test` | 기능 개발 통합 테스트 브랜치 |
| `feature/*`    | 기능별 개발 브랜치       |

### 개발 흐름

1. `develop-test` 브랜치에서 기능별 브랜치를 생성합니다.

```bash
git checkout develop-test
git pull origin develop-test
git checkout -b feature/기능명
```

2. 각자 맡은 기능을 개발합니다.

3. 기능 개발 완료 후 `develop-test` 브랜치로 PR을 생성합니다.

```bash
feature/기능명 → develop-test
```

4. GitHub 통합 관리자가 PR을 확인한 후 `develop-test`에 merge합니다.

5. `develop-test`에서 기능 충돌 및 실행 오류가 없는지 확인합니다.

6. 문제가 없을 경우 통합 관리자가 `develop` 브랜치에 반영합니다.

```bash
develop-test → develop
```

### PR 규칙

PR 제목은 아래 형식을 따릅니다.

```bash
[Feat] 로그인 API 구현
[Fix] 지도 API 오류 수정
[Docs] README 수정
[Refactor] 게시글 서비스 로직 분리
```

PR 작성 시 아래 내용을 포함합니다.

```md
## 작업 내용
- 구현한 기능 요약

## 테스트 내용
- 실행 여부
- 확인한 API 또는 화면

## 참고 사항
- 리뷰어가 확인해야 할 내용
```

### Commit Convention

| 타입         | 설명                 |
| ---------- | ------------------ |
| `feat`     | 새로운 기능 추가          |
| `fix`      | 버그 수정              |
| `docs`     | 문서 수정              |
| `style`    | 코드 포맷팅, 세미콜론 등     |
| `refactor` | 코드 리팩토링            |
| `test`     | 테스트 코드             |
| `chore`    | 설정 파일, 패키지 등 기타 작업 |

예시:

```bash
feat: 로그인 API 구현
fix: 모기지수 계산 오류 수정
docs: README 개발 컨벤션 추가
refactor: district service 로직 분리
```

### 작업 전 주의사항

작업 시작 전 항상 최신 브랜치를 pull 받은 뒤 진행합니다.

```bash
git checkout develop-test
git pull origin develop-test
git checkout -b feature/기능명
```

이미 작업 중인 브랜치가 있다면 아래 명령어로 최신 내용을 반영합니다.

```bash
git checkout feature/기능명
git pull origin develop-test
```

### Merge 관리

* 모든 기능 브랜치는 `develop-test`로 PR을 생성합니다.
* `develop-test` merge는 GitHub 통합 관리자가 담당합니다.
* `develop` 브랜치에는 직접 push하지 않습니다.
* `develop-test`에서 실행 및 충돌 확인 후 `develop`에 반영합니다.

### 브랜치 네이밍 예시

```bash
feature/login
feature/map
feature/ranking
feature/community
feature/mosquito-index
feature/deploy

fix/login-token
fix/map-response
docs/readme
refactor/post-service
```

## Backend Project Structure

```bash
src/
├── index.ts
├── auth.config.ts
├── db.config.ts
├── common/
│   ├── errors/
│   ├── middlewares/
│   └── responses/
├── generated/
│   ├── prisma/
│   └── routes.ts
└── modules/
    ├── mosquito/
    ├── district/
    ├── post/
    ├── comment/
    └── users/
```

### 개발 담당 예시

| 담당    | 주요 작업                     |
| ----- | ------------------------- |
| 로그인   | JWT 인증, 회원가입/로그인, 인증 미들웨어 |
| 지도    | 자치구 좌표, 모기지수 조회 API       |
| 랭킹    | 모기지수 기준 순위 조회 API         |
| 커뮤니티  | 게시글, 댓글, 좋아요 API          |
| 배포/통합 | 환경변수, 배포, 브랜치 통합 관리       |
