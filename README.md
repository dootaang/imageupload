# 아카라이브 스타일 이미지 업로드

이 프로젝트는 아카라이브와 동일한 형식의 이미지 업로드 기능을 제공하는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **아카라이브 스타일 이미지 업로드**: 실제 아카라이브에 이미지를 업로드하여 정확한 URL과 HTML 코드를 생성
- **자동 프록시 처리**: 클라우드플레어 보안과 CSRF 토큰을 자동으로 우회
- **다중 업로드 엔드포인트**: 여러 아카라이브 API 엔드포인트를 시도하여 성공률 향상
- **백업 시스템**: 아카라이브 업로드 실패 시 아카라이브 스타일의 대체 URL 생성
- **드래그 앤 드롭**: 파일을 드래그하여 쉽게 업로드
- **클립보드 붙여넣기**: Ctrl+V로 클립보드의 이미지 직접 업로드
- **실시간 미리보기**: 업로드된 이미지의 미리보기와 HTML 코드 제공

## 🎯 생성되는 결과물

### 아카라이브 URL
```
//ac-p1.namu.la/20250524sac/e9f61a7d8296cebf91c7f24993a7dfbb60397526fc1bace99002290ec003210d.png?expires=1748088934&key=P22_KC5Cr5ZJ6PTcDA_Qfw
```

### 아카라이브 HTML 코드
```html
<p><img src="//ac-p1.namu.la/20250524sac/e9f61a7d8296cebf91c7f24993a7dfbb60397526fc1bace99002290ec003210d.png?expires=1748088934&key=P22_KC5Cr5ZJ6PTcDA_Qfw" class="fr-fic fr-dii"></p>
```

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, Ant Design
- **Backend**: Next.js API Routes (Vercel Serverless Functions)
- **Deployment**: Vercel
- **Language**: TypeScript/JavaScript

## 📦 설치 및 실행

### 로컬 개발 환경

1. 저장소 클론
```bash
git clone <repository-url>
cd imageupload
```

2. 의존성 설치
```bash
cd image-upload-app
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

### Vercel 배포

1. Vercel에 프로젝트 연결
2. `image-upload-app` 폴더를 루트 디렉토리로 설정
3. 자동 배포 완료

## 🔧 프로젝트 구조

```
imageupload/
├── image-upload-app/           # 메인 Next.js 애플리케이션
│   ├── app/
│   │   ├── api/
│   │   │   └── proxy/
│   │   │       └── upload/
│   │   │           └── route.js    # 아카라이브 업로드 프록시 API
│   │   ├── components/
│   │   │   └── ImageUploader.tsx   # 이미지 업로드 컴포넌트
│   │   ├── utils/
│   │   │   └── imageUpload.ts      # 업로드 유틸리티 함수
│   │   ├── types/
│   │   │   └── index.ts            # 타입 정의
│   │   └── page.tsx                # 메인 페이지
│   └── package.json
├── proxy-server/               # 독립 실행형 프록시 서버 (선택사항)
│   ├── server.js
│   └── package.json
└── 예시/                      # 참조용 예시 코드
```

## 🎮 사용법

1. **파일 업로드**
   - "파일 선택하여 업로드" 버튼 클릭
   - 또는 파일을 드래그 앤 드롭
   - 또는 Ctrl+V로 클립보드 이미지 붙여넣기

2. **결과 확인**
   - 업로드 완료 후 아카라이브 URL과 HTML 코드가 자동 생성
   - 복사 버튼으로 클립보드에 복사

3. **아카라이브에서 사용**
   - 생성된 HTML 코드를 아카라이브 글쓰기에 붙여넣기
   - 또는 URL을 직접 사용

## ⚙️ 핵심 기능 설명

### 아카라이브 프록시 시스템

이 프로젝트의 핵심은 아카라이브의 보안 시스템을 우회하는 프록시입니다:

1. **세션 관리**: 아카라이브 메인 페이지에서 세션 쿠키와 CSRF 토큰을 자동 추출
2. **다중 엔드포인트**: 여러 업로드 API를 순차적으로 시도
3. **헤더 스푸핑**: 실제 브라우저와 동일한 헤더로 요청
4. **자동 재시도**: 세션 만료 시 자동으로 새 세션 생성

### 백업 시스템

아카라이브 업로드가 실패할 경우를 대비한 백업 시스템:

- 아카라이브와 동일한 형식의 URL 생성
- 나무위키 스타일 CDN URL 형태
- 만료 시간과 보안 키 포함

## 🔒 보안 고려사항

- 모든 업로드는 서버사이드에서 처리
- 파일 크기 제한 (10MB)
- 허용된 이미지 형식만 업로드 가능
- CSRF 토큰 자동 처리

## 🚨 주의사항

- 이 프로젝트는 교육 및 개인 사용 목적입니다
- 아카라이브의 이용약관을 준수해야 합니다
- 대량 업로드나 상업적 사용은 권장하지 않습니다

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- 아카라이브 커뮤니티
- Next.js 및 Vercel 팀
- Ant Design 팀 