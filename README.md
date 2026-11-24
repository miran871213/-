# 핏체크 5kg (FitCheck 5kg) - 체형별 AI 가상 피팅 웹 애플리케이션 (MVP)

쇼핑몰 상품 URL을 입력하면 고해상도 의류 이미지를 추출하고, 사용자가 선택한 몸무게(45kg~95kg, 5kg 단위)별 체형 모델에 해당 의류를 가상으로 입혀 착용 핏(Fit)을 비교할 수 있는 모바일 친화적 Next.js 웹 애플리케이션입니다.

---

## 🚀 빠른 시작 가이드 (Quick Start)

### 1. 패키지 설치
```bash
npm install
# 또는
pnpm install
# 또는
yarn install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

> **💡 바로 테스트 가능 (Mock 모드 내장):**  
> AI API 토큰을 발급받지 않은 상태에서도 `.env.local`의 내장 Mock 시뮬레이터가 자동으로 동작하여, **URL 추출 -> 5kg 단위 선택 -> 온디맨드 피팅 -> 2가지 무게 비교 -> 이미지 다운로드** 전체 플로우를 즉시 체험할 수 있습니다.

---

## 🔑 실제 Replicate AI (IDM-VTON) 연동 방법

실제 AI 가상 피팅을 구동하려면 [Replicate](https://replicate.com)에서 API 토큰을 발급받아 환경 변수에 등록합니다.

1. `.env.local` 파일 열기
2. `REPLICATE_API_TOKEN`에 발급받은 키 입력:
   ```env
   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TRYON_PROVIDER=auto
   ```
3. 개발 서버 재시작 (`npm run dev`)

---

## 📂 프로젝트 구조

```text
├── .env.example                  # 환경변수 예시 파일
├── .env.local                    # 로컬 환경변수 (API 토큰 설정)
├── .nvmrc                        # Node.js 20 버전 명시
├── netlify.toml                  # Netlify 배포 및 Next.js 런타임 플러그인 설정
├── next.config.js                # Next.js 설정 (원격 이미지 허용)
├── package.json                  # 프로젝트 종속성 및 스크립트
├── postcss.config.js             # PostCSS 설정
├── tailwind.config.js            # Tailwind CSS 테마 설정
├── tsconfig.json                 # TypeScript 설정
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── scrape/
    │   │   │   └── route.ts      # Cheerio 기반 쇼핑몰 URL 이미지 스크래핑 API
    │   │   └── try-on/
    │   │       └── route.ts      # IDM-VTON AI 가상 피팅 및 Mock 온디맨드 API
    │   ├── globals.css           # 전역 스타일 및 애니메이션
    │   ├── layout.tsx            # 루트 레이아웃 및 메타데이터
    │   └── page.tsx              # 메인 단일 페이지 플로우 (Input -> Fit -> Compare)
    ├── components/
    │   ├── CompareModal.tsx      # 두 가지 무게(예: 55kg vs 60kg) 나란히 비교 모달
    │   ├── Header.tsx            # 모바일 반응형 상단 헤더
    │   ├── TryOnViewer.tsx       # 대형 핏 뷰어, 스켈레톤, 5kg 퀵 스위처, 다운로드
    │   ├── UrlInputForm.tsx      # URL 크롤링 + 직접 사진 업로드 드래그앤드롭 + 데모 의류
    │   └── WeightSelector.tsx    # 성별/키/5kg 단위(45~95kg) 체형 선택 및 온디맨드 트리거
    ├── constants/
    │   └── models.ts             # 45kg~95kg 여성/남성 베이스 모델 및 데모 의류 매핑
    └── types/
        └── index.ts              # 전역 TypeScript 타입 정의
```

---

## ✨ 핵심 기능 및 특징

1. **하이브리드 의류 입력 (Input)**:
   - 쇼핑몰 URL 입력 시 `og:image`, `og:title`, 상세 이미지 자동 추출
   - 무신사, 크림 등 보안 차단 사이트 대응: 에러 시 즉시 "옷 사진 직접 올리기" 안내 및 드래그앤드롭/클립보드 붙여넣기 탭 전환
   - 상의/하의/원피스 카테고리 옵션 및 원클릭 데모 샘플 제공

2. **5kg 단위 온디맨드 생성 (Processing)**:
   - 45kg, 50kg, 55kg, 60kg, 65kg, 70kg, 75kg, 80kg, 85kg, 90kg, 95kg
   - 불필요한 백그라운드 일괄 생성을 방지하여 **사용자가 클릭한 무게만 실시간 온디맨드 생성** (비용/시간 절감)
   - 단계별 스켈레톤 UI (1단계 체형 로드 -> 2단계 의류 분석 -> 3단계 AI 합성)

3. **핏(Fit) 비교 뷰어 및 클라이언트 캐시 (Result)**:
   - 한 번 생성된 무게는 상태에 캐싱되어 탭 클릭 시 **즉시 렌더링**
   - **비교 모드 (Side-by-side):** 55kg vs 60kg 등 두 가지 체형 착용 이미지를 나란히 비교
   - 합성 결과 이미지 다운로드 및 링크 공유 지원

4. **Gemini 3.8 Flash & 3.5 Flash Lite AI 핏 어드바이저**:
   - **사용자 모델 선택:** `gemini-3.8-flash`(정밀 분석)와 `gemini-3.5-flash-lite`(초고속 라이트) 중 자유롭게 선택
   - **사용자 개인 API 키:** Google AI Studio 무료 키를 브라우저에 직접 등록하여 사용
   - 핏 정밀 진단, 권장 사이즈(S/M/L/XL), 체형 보정 코디 팁, 두 체형 대조 리포트 제공

---

## 🌐 Netlify 배포 가이드

1. GitHub 또는 GitLab에 해당 프로젝트를 푸시합니다.
2. [Netlify 대시보드](https://app.netlify.com)에서 **Add new site > Import an existing project**를 선택합니다.
3. 리포지토리를 선택하면 `netlify.toml` 설정에 따라 다음 빌드 설정이 자동 구성됩니다:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Next.js Runtime**: `@netlify/plugin-nextjs` 자동 적용
4. **Site configuration > Environment variables** 메뉴에서 환경 변수를 등록합니다:
   - `REPLICATE_API_TOKEN`: `r8_...` (실제 AI 구동 시)
   - `TRYON_PROVIDER`: `auto` 또는 `mock`
5. **Deploy site** 버튼을 클릭하면 수 분 내에 무료 HTTPS 도메인으로 배포가 완료됩니다.
