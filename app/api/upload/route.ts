import { NextRequest, NextResponse } from 'next/server';

// 동적 라우트 설정 - 서버리스 함수로 실행
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('upload') as File;

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

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기가 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 지원되는 파일 형식 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 추출
    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    // 모의 아카라이브 스타일 URL 생성 (실제 구현에서는 실제 이미지 호스팅 서비스를 사용하세요)
    const randomId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const imageUrl = `https://files.arca.live/uploads/${timestamp}_${randomId}.${fileExtension}`;
    
    console.log('Upload successful:', imageUrl);

    return NextResponse.json({
      success: true,
      url: imageUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { error: '업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '아카라이브 이미지 업로드 API가 실행 중입니다.',
    timestamp: new Date().toISOString()
  });
} 