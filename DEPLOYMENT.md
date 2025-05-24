# 이미지 업로드 앱 배포 가이드

이 문서는 이미지 업로드 앱을 Vercel 또는 GitHub Pages에 배포하는 방법을 설명합니다.

## 🚀 Vercel 배포 (추천)

### 1. Vercel 계정 생성 및 준비
1. [Vercel](https://vercel.com)에서 계정을 생성하세요
2. GitHub 계정과 연동하세요

### 2. 자동 배포 (GitHub 연동)
1. GitHub에 프로젝트를 업로드하세요:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[your-username]/[repository-name].git
   git push -u origin main
   ```

2. Vercel 대시보드에서 "New Project" 클릭
3. GitHub 저장소를 선택하고 Import
4. Root Directory를 `image-upload-app`로 설정
5. Deploy 버튼 클릭

### 3. 수동 배포 (Vercel CLI)
1. Vercel CLI 설치:
   ```bash
   npm install -g vercel
   ```

2. 프로젝트 폴더에서 로그인:
   ```bash
   cd image-upload-app
   vercel login
   ```

3. 배포:
   ```bash
   vercel --prod
   ```

## 📦 GitHub Pages 배포

### 정적 사이트 생성
1. `next.config.ts` 파일 수정:
   ```typescript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     basePath: '/[repository-name]',
     assetPrefix: '/[repository-name]/',
     images: {
       unoptimized: true
     }
   };

   export default nextConfig;
   ```

2. 빌드 및 배포:
   ```bash
   npm run build
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. GitHub 저장소 Settings → Pages에서 Source를 "GitHub Actions"로 설정

## 🔧 환경 변수 설정

### Vercel 환경 변수
배포 후 Vercel 대시보드에서 다음 환경 변수를 설정하세요:

- `NEXT_PUBLIC_API_URL`: API 엔드포인트 URL (배포된 도메인)

### API 라우트
- 업로드 API: `/api/upload`
- 헬스 체크: `/api/upload` (GET 요청)

## 🚀 배포 후 확인사항

1. **웹사이트 접속**: 배포된 URL로 접속하여 정상 작동 확인
2. **이미지 업로드 테스트**: 드래그&드롭, 파일 선택, 클립보드 붙여넣기 테스트
3. **API 엔드포인트 확인**: `/api/upload`에서 헬스 체크 확인

## 📱 모바일 최적화

앱은 반응형으로 제작되어 모바일 기기에서도 정상 작동합니다:
- 터치 인터페이스 지원
- 모바일 파일 선택기 지원
- 반응형 UI 디자인

## 🎯 주요 기능

- ✅ 드래그 앤 드롭 파일 업로드
- ✅ 클립보드 이미지 붙여넣기 (Ctrl+V)
- ✅ 아카라이브 스타일 URL 생성
- ✅ HTML 코드 자동 생성
- ✅ 파일 유효성 검증
- ✅ 모바일 반응형 디자인

## 🔍 문제 해결

### 배포 실패 시
1. Node.js 버전 확인 (18 이상 권장)
2. 의존성 설치 상태 확인: `npm install`
3. 로컬에서 빌드 테스트: `npm run build`

### API 오류 시
1. API 라우트 경로 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. Vercel Functions 로그 확인

## 📞 지원

배포 과정에서 문제가 발생하면:
1. GitHub Issues에 문제 보고
2. Vercel 공식 문서 참조
3. Next.js 공식 문서 참조 