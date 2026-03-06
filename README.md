# HoBom Tech Blog

Angular 19 기반의 기술 블로그 프론트엔드. Vercel에 정적 SPA로 배포됩니다.

> https://hobom-tech-blog.vercel.app

---

## Tech stack

- **Angular** 19 (standalone components, signals)
- **ngx-markdown** (Markdown 렌더링)
- **RxJS**
- **Vercel** (정적 SPA 배포)

---

## Quick start

### Prerequisites

- Node.js 20.19+
- npm

### Install & Run

```bash
npm ci
npm run start
```

### Build

```bash
npm run build
```

---

## Project structure

```
src/
  app/
    core/
      models/        # 데이터 모델 (Article, ApiResponse 등)
      ports/         # 추상 포트 (PostsPort)
      services/      # API 서비스 구현
      router/        # 라우팅 경로 상수
    features/
      home/          # 메인 페이지 (프로필, 소개, 게시글 목록)
      detail/        # 게시글 상세 페이지
  environments/
  index.html
public/
  robots.txt
  sitemap.xml
vercel.json
```

---

## Deploy (Vercel)

- Framework preset: **Angular**
- Build command: `npm run build`
- Output directory: `dist/hobom-tech-blog`
- `vercel.json`으로 API 리라이트 및 SPA 폴백 처리

---

## Author

**JunHo Kim** — [@FoxMon](https://github.com/FoxMon)

## License

MIT (c) HoBom
