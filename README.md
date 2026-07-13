# kccc-info-portfolio

대학생활 CCC 홍보용 **모바일 풀페이지 슬라이드** 정적 웹사이트입니다.  
Swiper 기반 8개 섹션, 내부 이미지 캐러셀, 360° 파노라마 모달, CONTACT 링크 안내를 제공합니다.

## 주요 기능

- **8개 메인 슬라이드**: 홈, CCC 소개, 인생친구, 성장훈련, 축제, 해외선교, 선배 이야기, Contact
- **내부 캐러셀**: 슬라이드별 2열 이미지 갤러리 (Swiper loop)
- **360° 파노라마**: 썸네일 클릭 시 Pannellum 모달 뷰어
- **Lazy Load**: 슬라이드 진입 시 이미지·비디오 지연 로드
- **성능 최적화**: WebP 이미지, CSS 번들, woff2 폰트, LCP preload

## 기술 스택

| 구분 | 사용 |
|------|------|
| 마크업 | HTML5 |
| 스타일 | CSS (커스텀 `style.css` + Swiper / Pannellum / normalize) |
| 스크립트 | Vanilla JS (`js/app.js`) |
| 슬라이드 | Swiper 3.4.2 |
| 파노라마 | Pannellum |
| 빌드 | Node.js (sharp, wawoff2) |

## 프로젝트 구조

```
├── index.html          # 메인 페이지
├── js/
│   └── app.js          # 슬라이드·캐러셀·모달 로직
├── css/
│   ├── style.css       # 커스텀 스타일 (편집 대상)
│   ├── bundle.css      # 빌드 산출물 (비압축)
│   └── bundle.min.css  # 배포용 통합 CSS ★
├── img/                # 이미지 (WebP + 원본 fallback)
├── scripts/
│   ├── build-images.mjs
│   └── build-css.mjs
├── package.json
├── vercel.json         # Vercel 캐시·보안 헤더
└── _headers            # Netlify 등 정적 호스팅용 헤더
```

> 배포 시 브라우저는 `css/bundle.min.css`와 `img/*.webp`를 사용합니다.

## 로컬 실행

빌드 없이도 정적 파일 서버로 바로 확인할 수 있습니다.

```bash
# 예: npx serve
npx serve .

# 또는 Python
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` (또는 serve 기본 포트)로 접속합니다.

## 빌드

```bash
npm install
npm run build
```

| 스크립트 | 설명 |
|----------|------|
| `npm run build:images` | GIF/JPEG/PNG → WebP 변환 (`img/*.webp`) |
| `npm run build:css` | CSS 4개 파일 → `bundle.css` / `bundle.min.css` |
| `npm run build` | 이미지 + CSS 전체 빌드 |

**CSS를 수정한 경우** 반드시 `npm run build:css` (또는 `npm run build`) 후 `bundle.min.css`가 갱신되었는지 확인하세요.

## 배포

정적 호스팅에 **루트 디렉터리 전체**를 업로드하면 됩니다.  
`node_modules/`는 배포 대상이 아닙니다.

- **Vercel**: `vercel.json` 캐시 헤더 적용
- **Netlify / Cloudflare Pages**: `_headers` 참고
- **Apache**: `.htaccess` (로컬 gitignore 대상일 수 있음)

비디오는 CDN에서 로드됩니다: `https://cccvlm.com/cccvlm/video/introduce/`

## 브라우저 지원

모던 모바일 브라우저 (Chrome, Safari, Samsung Internet 등)  
`picture` + WebP, `preload`, `loading="lazy"` 사용

## 라이선스

CCC 홍보 목적의 내부·포트폴리오 프로젝트입니다.  
이미지·영상·브랜드 자산의 저작권은 각 권리자에게 있습니다.
