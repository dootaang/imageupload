import { NextResponse } from 'next/server';

// 아카라이브 세션 관리 (메모리 저장)
let arcaSession = {
  cookies: '',
  csrfToken: '',
  lastUpdate: 0,
  sessionId: ''
};

// 랜덤 딜레이 함수 (인간적인 행동 모방)
function randomDelay(min = 1000, max = 3000) {
  return new Promise(resolve => {
    const delay = Math.random() * (max - min) + min;
    setTimeout(resolve, delay);
  });
}

// 실제 브라우저처럼 보이는 헤더 생성
function generateRealisticHeaders(referer = 'https://arca.live/') {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
  ];

  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  return {
    'User-Agent': randomUA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Cache-Control': 'max-age=0',
    'Referer': referer
  };
}

// Imgur에 업로드하는 함수 (대안)
async function uploadToImgur(fileBuffer, fileName) {
  try {
    console.log('Attempting fallback upload to Imgur...');
    
    // Base64로 인코딩
    const base64 = Buffer.from(fileBuffer).toString('base64');
    
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7', // 공개 Imgur Client ID
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
        type: 'base64',
        name: fileName,
        title: 'Uploaded from Arca Image Uploader'
      }),
    });

    if (!response.ok) {
      throw new Error(`Imgur API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.link) {
      console.log('Imgur upload successful:', data.data.link);
      return data.data.link;
    } else {
      throw new Error('Imgur upload failed: No link in response');
    }
  } catch (error) {
    console.error('Imgur upload error:', error);
    throw error;
  }
}

// freeimage.host에 업로드하는 함수 (대안 2)
async function uploadToFreeImageHost(fileBuffer, fileName, mimeType) {
  try {
    console.log('Attempting fallback upload to freeimage.host...');
    
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('source', blob, fileName);
    formData.append('type', 'file');
    formData.append('action', 'upload');
    formData.append('timestamp', Date.now().toString());
    formData.append('auth_token', 'f9e8d7c6b5a4938271605ead4f2b3c1d'); // 공개 토큰

    const response = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`FreeImageHost API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status_code === 200 && data.image && data.image.url) {
      console.log('FreeImageHost upload successful:', data.image.url);
      return data.image.url;
    } else {
      throw new Error('FreeImageHost upload failed');
    }
  } catch (error) {
    console.error('FreeImageHost upload error:', error);
    throw error;
  }
}

// 아카라이브 세션 초기화 (더 정교한 방법)
async function initializeArcaSession() {
  try {
    console.log('Starting Arca session initialization...');
    
    // 첫 번째 요청: 메인 페이지 접근
    await randomDelay(500, 1500);
    
    const headers = generateRealisticHeaders();
    const response = await fetch('https://arca.live/', {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 쿠키 추출 및 파싱
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length > 0) {
      arcaSession.cookies = setCookieHeaders
        .map(cookie => cookie.split(';')[0])
        .filter(cookie => cookie.includes('='))
        .join('; ');
    }

    // HTML에서 CSRF 토큰 추출
    const html = await response.text();
    
    // 여러 패턴으로 CSRF 토큰 찾기
    const csrfPatterns = [
      /name=["\']_token["\'] content=["\']([^"\']+)["\']/,
      /csrf-token["\'] content=["\']([^"\']+)["\']/,
      /_token["\']:\s*["\']([^"\']+)["\']/,
      /window\.Laravel\s*=\s*[^}]*_token["\']:\s*["\']([^"\']+)["\']/,
      /meta.*?name=["\']csrf-token["\'].*?content=["\']([^"\']+)["\']/
    ];

    for (const pattern of csrfPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        arcaSession.csrfToken = match[1];
        break;
      }
    }

    // 세션 ID 생성
    arcaSession.sessionId = Math.random().toString(36).substring(2, 15);
    arcaSession.lastUpdate = Date.now();
    
    console.log('Arca session initialized:', { 
      hasCookies: !!arcaSession.cookies, 
      hasCsrfToken: !!arcaSession.csrfToken,
      sessionId: arcaSession.sessionId
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Arca session:', error);
    return false;
  }
}

// 아카라이브 업로드 시도 (개선된 버전)
async function uploadToArca(fileBuffer, fileName, mimeType) {
  const uploadEndpoints = [
    'https://arca.live/image_upload',
    'https://arca.live/b/hammer/write/image_upload',
    'https://arca.live/api/image_upload',
    'https://arca.live/b/game/write/image_upload'
  ];

  for (let i = 0; i < uploadEndpoints.length; i++) {
    const endpoint = uploadEndpoints[i];
    
    // 각 시도 전에 딜레이
    if (i > 0) {
      await randomDelay(2000, 4000);
    }

    try {
      console.log(`Attempting upload to: ${endpoint}`);
      
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('upload', blob, fileName);

      // CSRF 토큰 추가
      if (arcaSession.csrfToken) {
        formData.append('_token', arcaSession.csrfToken);
      }

      // 업로드 전용 헤더 생성
      const uploadHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://arca.live/b/hammer/write',
        'Origin': 'https://arca.live',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      };

      // 쿠키 추가
      if (arcaSession.cookies) {
        uploadHeaders['Cookie'] = arcaSession.cookies;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: uploadHeaders
      });

      console.log(`Response from ${endpoint}: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch {
            console.log('Non-JSON response:', text);
            continue;
          }
        }

        console.log('Upload response data:', data);
        
        // 다양한 응답 형식 처리
        let imageUrl = data.link || data.url || data.location || data.path || data.src || data.file_url;
        
        if (imageUrl) {
          // URL 정규화
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            imageUrl = 'https://arca.live' + imageUrl;
          } else if (!imageUrl.startsWith('http')) {
            imageUrl = 'https://arca.live/' + imageUrl;
          }
          
          console.log(`Upload successful to ${endpoint}:`, imageUrl);
          return imageUrl;
        }
      } else {
        const errorText = await response.text();
        console.log(`Failed upload to ${endpoint}:`, response.status, errorText);
        
        // 429 (Too Many Requests)나 403 (Forbidden) 에러 시 더 긴 딜레이
        if (response.status === 429 || response.status === 403) {
          await randomDelay(5000, 10000);
        }
      }
    } catch (error) {
      console.log(`Error uploading to ${endpoint}:`, error.message);
      
      // 네트워크 에러 시 딜레이
      await randomDelay(1000, 3000);
    }
  }

  throw new Error('아카라이브 업로드 실패');
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

    // 파일을 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();
    let imageUrl = null;
    let uploadSource = 'unknown';

    // 1단계: 아카라이브 업로드 시도
    try {
      // 세션 초기화 또는 갱신 (3분마다)
      if (!arcaSession.cookies || !arcaSession.csrfToken || Date.now() - arcaSession.lastUpdate > 180000) {
        console.log('Refreshing Arca session...');
        await initializeArcaSession();
      }

      // 업로드 전 딜레이
      await randomDelay(500, 1500);
      
      // 아카라이브에 업로드 시도
      imageUrl = await uploadToArca(fileBuffer, file.name, file.type);
      uploadSource = 'arca.live';
      
    } catch (arcaError) {
      console.log('Arca upload failed, trying fallback options:', arcaError.message);
      
      // 2단계: Imgur 업로드 시도
      try {
        imageUrl = await uploadToImgur(fileBuffer, file.name);
        uploadSource = 'imgur.com';
      } catch (imgurError) {
        console.log('Imgur upload failed, trying next fallback:', imgurError.message);
        
        // 3단계: FreeImageHost 업로드 시도
        try {
          imageUrl = await uploadToFreeImageHost(fileBuffer, file.name, file.type);
          uploadSource = 'freeimage.host';
        } catch (freeImageError) {
          console.log('All upload methods failed:', freeImageError.message);
          
          return NextResponse.json({
            success: false,
            error: '모든 이미지 호스팅 서비스에서 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.'
          }, { status: 500 });
        }
      }
    }

    if (imageUrl) {
      return NextResponse.json({
        success: true,
        url: imageUrl,
        source: uploadSource,
        message: uploadSource === 'arca.live' ? 
          '아카라이브에 성공적으로 업로드되었습니다.' : 
          `아카라이브 업로드에 실패하여 ${uploadSource}에 업로드되었습니다.`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '이미지 업로드에 실패했습니다.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { error: '업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// CORS 헤더 추가
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 