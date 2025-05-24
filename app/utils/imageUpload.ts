import { UploadResponse } from '../types';

/**
 * 아카라이브에 이미지를 업로드하는 함수
 * 프록시 서버를 통해 클라우드플레어 보안을 우회합니다.
 */
export const uploadImageToArca = async (
  file: File
): Promise<UploadResponse> => {
  try {
    // 파일 유효성 검사
    if (!file) {
      throw new Error('파일이 선택되지 않았습니다.');
    }

    // 파일 크기 검사 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('파일 크기가 10MB를 초과합니다.');
    }

    // 파일 타입 검사
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 지원)');
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('upload', file);

    // API 라우트로 업로드 요청
    const response = await fetch('/api/proxy/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`업로드 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 응답 검증
    if (!data.success || !data.url) {
      throw new Error(data.error || '업로드 응답이 올바르지 않습니다.');
    }

    // 아카라이브 형식의 URL 반환
    return {
      status: true,
      url: data.url,
    };
  } catch (error) {
    console.error('Upload error:', error);

    return {
      status: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

/**
 * 이미지 파일을 검증하는 함수
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { isValid: false, error: '파일이 선택되지 않았습니다.' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: '파일 크기가 10MB를 초과합니다.' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: '지원되지 않는 파일 형식입니다.' };
  }

  return { isValid: true };
};

/**
 * 아카라이브 스타일 HTML 마크업을 생성하는 함수
 * 실제 아카라이브에서 사용하는 형식과 동일하게 생성
 */
export const generateArcaImageHTML = (imageUrl: string): string => {
  // 아카라이브 스타일의 이미지 HTML 생성 (fr-fic fr-dii 클래스 포함)
  return `<p><img src="${imageUrl}" class="fr-fic fr-dii"></p>`;
};

/**
 * 클립보드에서 이미지를 추출하는 함수
 */
export const extractImageFromClipboard = async (
  clipboardData: DataTransfer
): Promise<File | null> => {
  const items = clipboardData.items;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      return item.getAsFile();
    }
  }
  
  return null;
}; 