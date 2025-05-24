import { NextResponse } from 'next/server';

// 아카라이브 세션 관리 (메모리 저장)
let arcaSession = {
  cookies: '',
  csrfToken: '',
  lastUpdate: 0
};

// 아카라이브 세션 초기화
async function initializeArcaSession() {
  try {
    const response = await fetch('https://arca.live/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // 쿠키 추출
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      arcaSession.cookies = setCookieHeaders.split(',').map(cookie => cookie.split(';')[0]).join('; ');
    }

    // CSRF 토큰 추출
    const html = await response.text();
    const csrfMatch = html.match(/name=["\']_token["\'] content=["\']([^"\']+)["\']/) || 
                     html.match(/csrf-token["\'] content=["\']([^"\']+)["\']/) ||
                     html.match(/_token["\']:\s*["\']([^"\']+)["\']/);
    
    if (csrfMatch) {
      arcaSession.csrfToken = csrfMatch[1];
    }

    arcaSession.lastUpdate = Date.now();
    console.log('Arca session initialized:', { cookies: !!arcaSession.cookies, csrfToken: !!arcaSession.csrfToken });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Arca session:', error);
    return false;
  }
}

// 아카라이브 업로드 시도
async function uploadToArca(fileBuffer, fileName, mimeType) {
  const uploadEndpoints = [
    'https://arca.live/image_upload',
    'https://arca.live/b/hammer/write/image_upload',
    'https://arca.live/api/image_upload'
  ];

  for (const endpoint of uploadEndpoints) {
    try {
      console.log(`Trying upload endpoint: ${endpoint}`);
      
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('upload', blob, fileName);

      if (arcaSession.csrfToken) {
        formData.append('_token', arcaSession.csrfToken);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://arca.live/',
          'Origin': 'https://arca.live',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': arcaSession.cookies
        }
      });

      console.log(`Response from ${endpoint}:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        let imageUrl = data.link || data.url || data.location || data.path;
        
        if (imageUrl) {
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            imageUrl = 'https://arca.live' + imageUrl;
          }
          
          console.log(`Upload successful to ${endpoint}:`, imageUrl);
          return imageUrl;
        }
      }
    } catch (error) {
      console.log(`Failed to upload to ${endpoint}:`, error);
    }
  }

  throw new Error('모든 아카라이브 업로드 엔드포인트에서 실패했습니다.');
}



export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('upload');

    if (!file) {
      return NextResponse.json(
        { error: '파일이 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // 파일 크기 및 타입 검증
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기가 10MB를 초과합니다.' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다.' },
        { status: 400 }
      );
    }

    // 세션 초기화 (5분마다)
    if (!arcaSession.cookies || Date.now() - arcaSession.lastUpdate > 300000) {
      console.log('Refreshing Arca session...');
      await initializeArcaSession();
    }

    try {
      // 파일을 ArrayBuffer로 변환
      const fileBuffer = await file.arrayBuffer();
      
      // 아카라이브에 업로드 시도
      const imageUrl = await uploadToArca(fileBuffer, file.name, file.type);
      
      return NextResponse.json({
        success: true,
        url: imageUrl
      });
        } catch (arcaError) {      console.error('Arca upload failed:', arcaError);            return NextResponse.json({        success: false,        error: '아카라이브 업로드에 실패했습니다: ' + arcaError.message      }, { status: 500 });    }

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { error: '업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// CORS 헤더 추가
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 