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
    console.log('[Imgur] Attempting fallback upload to Imgur...');
    
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
      const errorText = await response.text();
      console.error(`[Imgur] API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Imgur API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Imgur] Response data:', data);
    
    if (data.success && data.data && data.data.link) {
      console.log('[Imgur] Upload successful:', data.data.link);
      return data.data.link;
    } else {
      console.error('[Imgur] Upload failed: No link in response', data);
      throw new Error('Imgur upload failed: No link in response');
    }
  } catch (error) {
    console.error('[Imgur] Upload error:', error.message, error.stack);
    throw error;
  }
}

// freeimage.host에 업로드하는 함수 (대안 2)
async function uploadToFreeImageHost(fileBuffer, fileName, mimeType) {
  try {
    console.log('[FreeImageHost] Attempting fallback upload to freeimage.host...');
    
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
      const errorText = await response.text();
      console.error(`[FreeImageHost] API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`FreeImageHost API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[FreeImageHost] Response data:', data);
    
    if (data.status_code === 200 && data.image && data.image.url) {
      console.log('[FreeImageHost] Upload successful:', data.image.url);
      return data.image.url;
    } else {
      console.error('[FreeImageHost] Upload failed', data);
      throw new Error('FreeImageHost upload failed');
    }
  } catch (error) {
    console.error('[FreeImageHost] Upload error:', error.message, error.stack);
    throw error;
  }
}

// 아카라이브 세션 초기화 (더 정교한 방법)
async function initializeArcaSession() {
  console.log('[ArcaSession] Starting Arca session initialization...');
  try {
    await randomDelay(500, 1500);
    
    const headers = generateRealisticHeaders();
    console.log('[ArcaSession] Requesting GET https://arca.live/ with headers:', JSON.stringify(headers));
    const response = await fetch('https://arca.live/', {
      method: 'GET',
      headers: headers
    });
    
    console.log('[ArcaSession] Response from GET https://arca.live/: ' + response.status + ' ' + response.statusText);
    console.log('[ArcaSession] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ArcaSession] HTTP ' + response.status + ': ' + response.statusText + '. Body:', errorText.substring(0, 500));
      throw new Error('HTTP ' + response.status + ': ' + response.statusText);
    }

    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length > 0) {
      arcaSession.cookies = setCookieHeaders
        .map(cookie => cookie.split(';')[0])
        .filter(cookie => cookie.includes('='))
        .join('; ');
      console.log('[ArcaSession] Extracted cookies:', arcaSession.cookies);
    } else {
      console.log('[ArcaSession] No Set-Cookie headers found.');
    }

    const html = await response.text();
    
    const csrfPatterns = [
      /name=["\']_token["\'] content=["\']([^"\']+)["\']/,\n      /csrf-token["\'] content=["\']([^"\']+)["\']/,\n      /_token["\']:\s*["\']([^"\']+)["\']/,\n      /window\.Laravel\s*=\s*[^}]*_token["\']:\s*["\']([^"\']+)["\']/,\n      /meta.*?name=["\']csrf-token["\'].*?content=["\']([^"\']+)["\']/
    ];
    
    let foundToken = false;
    for (const pattern of csrfPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        arcaSession.csrfToken = match[1];
        foundToken = true;
        console.log('[ArcaSession] Extracted CSRF token using pattern', pattern, ':', arcaSession.csrfToken);
        break;
      }
    }
    if (!foundToken) {
        console.warn('[ArcaSession] CSRF token not found. HTML snippet (first 1000 chars):', html.substring(0, 1000));
    }

    arcaSession.sessionId = Math.random().toString(36).substring(2, 15);
    arcaSession.lastUpdate = Date.now();
    
    console.log('[ArcaSession] Arca session initialized:', { 
      hasCookies: !!arcaSession.cookies, 
      hasCsrfToken: !!arcaSession.csrfToken,
      sessionId: arcaSession.sessionId,
      lastUpdate: new Date(arcaSession.lastUpdate).toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('[ArcaSession] Failed to initialize Arca session:', error.message, error.stack);
    arcaSession.csrfToken = ''; // 에러 발생 시 토큰 초기화
    return false;
  }
}

// 아카라이브 업로드 시도 (개선된 버전)
async function uploadToArca(fileBuffer, fileName, mimeType) {
  console.log('[ArcaUpload] Attempting upload to Arca.live...');
  const uploadEndpoints = [
    'https://arca.live/image_upload',
    'https://arca.live/b/hammer/write/image_upload',
    'https://arca.live/api/image_upload',
    'https://arca.live/b/game/write/image_upload'
  ];

  for (let i = 0; i < uploadEndpoints.length; i++) {
    const endpoint = uploadEndpoints[i];
    
    if (i > 0) {
      await randomDelay(2000, 4000);
    }

    try {
      console.log('[ArcaUpload] Attempting upload to: ' + endpoint);
      
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('upload', blob, fileName);

      if (arcaSession.csrfToken) {
        formData.append('_token', arcaSession.csrfToken);
        console.log('[ArcaUpload] Appended _token: ' + arcaSession.csrfToken);
      } else {
        console.warn('[ArcaUpload] No CSRF token available for upload.');
      }

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

      if (arcaSession.cookies) {
        uploadHeaders['Cookie'] = arcaSession.cookies;
        console.log('[ArcaUpload] Using cookies for ' + endpoint + ': ' + arcaSession.cookies);
      } else {
        console.warn('[ArcaUpload] No cookies available for ' + endpoint);
      }
      
      console.log('[ArcaUpload] Requesting POST ' + endpoint + ' with headers:', JSON.stringify(uploadHeaders));
      console.log('[ArcaUpload] FormData fields: upload (filename: ' + fileName + ', type: ' + mimeType + ', size: ' + fileBuffer.byteLength + '), _token (if present)');


      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: uploadHeaders
      });

      console.log('[ArcaUpload] Response from ' + endpoint + ': ' + response.status + ' ' + response.statusText);
      const responseBodyText = await response.text(); 
      console.log('[ArcaUpload] Response body from ' + endpoint + ' (first 500 chars):', responseBodyText.substring(0, 500));


      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType?.includes('application/json')) {
          try {
            data = JSON.parse(responseBodyText); 
          } catch (e) {
            console.error('[ArcaUpload] Failed to parse JSON response from ' + endpoint + ': ', e, 'Body:', responseBodyText);
            continue; 
          }
        } else {
           console.log('[ArcaUpload] Non-JSON response from ' + endpoint + '. Content-Type: ' + contentType + '. Body:', responseBodyText.substring(0, 500));
          continue; 
        }

        console.log('[ArcaUpload] Parsed response data from ' + endpoint + ':', data);
        
        let imageUrl = data.link || data.url || data.location || data.path || data.src || data.file_url || (data.data && data.data.url);
        
        if (typeof data.url === 'string' && data.url.startsWith('/')) { 
          imageUrl = 'https://arca.live' + data.url;
        }


        if (imageUrl) {
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) { 
             imageUrl = 'https://arca.live' + imageUrl;
          } else if (!imageUrl.startsWith('http')) {
            imageUrl = 'https://arca.live/' + imageUrl; 
          }
          
          console.log('[ArcaUpload] Upload successful to ' + endpoint + ':', imageUrl);
          return imageUrl;
        } else {
          console.warn('[ArcaUpload] Upload to ' + endpoint + ' seemed OK, but no image URL found in response:', data);
        }
      } else {
        console.error('[ArcaUpload] Failed upload to ' + endpoint + ': ' + response.status + ' ' + response.statusText + '. Body:', responseBodyText.substring(0, 500));
        if (response.status === 403 && responseBodyText.includes("CSRF")) {
            console.warn("[ArcaUpload] CSRF token likely invalid or missing. Forcing session re-initialization.");
            arcaSession.csrfToken = ''; // CSRF 토큰 문제로 판단되면 토큰 초기화
            arcaSession.lastUpdate = 0; // 세션 강제 갱신 유도
        }
        if (response.status === 429 || response.status === 403) {
          await randomDelay(5000, 10000);
        }
      }
    } catch (error) {
      console.error('[ArcaUpload] Error uploading to ' + endpoint + ':', error.message, error.stack);
      await randomDelay(1000, 3000);
    }
  }
  console.error('[ArcaUpload] All Arca.live upload attempts failed.');
  throw new Error('아카라이브 모든 엔드포인트 업로드 실패');
}

export async function POST(request) {
  console.log('[ProxyPOST] Received POST request');
  try {
    const formData = await request.formData();
    const file = formData.get('upload');

    if (!file) {
      console.error('[ProxyPOST] No file uploaded.');
      return NextResponse.json(
        { error: '파일이 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('[ProxyPOST] File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      console.error('[ProxyPOST] File size ' + file.size + ' exceeds limit of ' + maxSize);
      return NextResponse.json(
        { error: '파일 크기가 10MB를 초과합니다.' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      console.error('[ProxyPOST] File type ' + file.type + ' is not allowed.');
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다.' },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    let imageUrl = null;
    let uploadSource = 'unknown';
    let message = '';

    try {
      console.log('[ProxyPOST] Attempting Arca.live upload...');
      if (!arcaSession.cookies || !arcaSession.csrfToken || Date.now() - arcaSession.lastUpdate > 180000) { // 3분
        console.log('[ProxyPOST] Arca session is old or missing. Initializing/Refreshing session...');
        const sessionInitialized = await initializeArcaSession();
        if (!sessionInitialized || !arcaSession.csrfToken) { 
            console.warn('[ProxyPOST] Failed to initialize Arca session or get CSRF token. Trying fallback upload directly.');
        }
      } else {
        console.log('[ProxyPOST] Using existing Arca session. Last updated:', new Date(arcaSession.lastUpdate).toISOString());
      }

      await randomDelay(500, 1500);
      
      imageUrl = await uploadToArca(fileBuffer, file.name, file.type);
      uploadSource = 'arca.live';
      message = '아카라이브에 성공적으로 업로드되었습니다.';
      console.log('[ProxyPOST] Arca.live upload successful. URL: ' + imageUrl);
      
    } catch (arcaError) {
      console.error('[ProxyPOST] Arca.live upload failed: ' + arcaError.message + '. Attempting fallback options...', arcaError.stack);
      
      try {
        console.log('[ProxyPOST] Attempting Imgur fallback...');
        imageUrl = await uploadToImgur(fileBuffer, file.name);
        uploadSource = 'imgur.com';
        message = '아카라이브 업로드에 실패하여 Imgur에 업로드되었습니다.';
        console.log('[ProxyPOST] Imgur fallback successful. URL: ' + imageUrl);
      } catch (imgurError) {
        console.error('[ProxyPOST] Imgur fallback failed: ' + imgurError.message + '. Attempting FreeImageHost fallback...', imgurError.stack);
        
        try {
          console.log('[ProxyPOST] Attempting FreeImageHost fallback...');
          imageUrl = await uploadToFreeImageHost(fileBuffer, file.name, file.type);
          uploadSource = 'freeimage.host';
          message = '아카라이브 및 Imgur 업로드에 실패하여 FreeImage.host에 업로드되었습니다.';
          console.log('[ProxyPOST] FreeImageHost fallback successful. URL: ' + imageUrl);
        } catch (freeImageError) {
          console.error('[ProxyPOST] All upload methods failed: ' + freeImageError.message, freeImageError.stack);
          return NextResponse.json({
            success: false,
            error: '모든 이미지 호스팅 서비스에서 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.',
            details: freeImageError.message
          }, { status: 500 });
        }
      }
    }

    if (imageUrl) {
      console.log('[ProxyPOST] Final image URL: ' + imageUrl + ', Source: ' + uploadSource);
      return NextResponse.json({
        success: true,
        url: imageUrl,
        source: uploadSource,
        message: message
      });
    } else {
      // 이 경우는 보통 위에서 이미 처리되었어야 함
      console.error('[ProxyPOST] Image URL is null after all attempts. This should not happen.');
      return NextResponse.json({
        success: false,
        error: '이미지 업로드에 실패했습니다. (알 수 없는 원인)'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[ProxyPOST] Unhandled error in POST handler:', error.message, error.stack);
    return NextResponse.json({
      error: '업로드 중 심각한 오류가 발생했습니다.',
      details: error.message
    }, { status: 500 });
  }
}

// CORS 헤더 추가
export async function OPTIONS() {
  console.log('[ProxyOPTIONS] Received OPTIONS request');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // 실제 프로덕션에서는 특정 도메인으로 제한하는 것이 좋습니다.
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 