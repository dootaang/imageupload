'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Button, App, Card, Typography, Space, Divider } from 'antd';
import { UploadOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadImageToArca, generateArcaImageHTML, validateImageFile } from '../utils/imageUpload';
import { ImageUrlResult } from '../types';

const { Title, Text, Paragraph } = Typography;

interface ImageUploaderProps {
  onUploadSuccess?: (result: ImageUrlResult) => void;
  onUploadError?: (error: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageUrlResult[]>([]);

  // 파일 업로드 핸들러
  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);

    try {
      // 파일 유효성 검사
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 아카라이브에 업로드
      const result = await uploadImageToArca(file);

      if (result.status && result.url) {
        const imageResult: ImageUrlResult = {
          originalUrl: URL.createObjectURL(file),
          arcaUrl: result.url,
          timestamp: Date.now(),
        };

        setUploadedImages(prev => [imageResult, ...prev]);
        onUploadSuccess?.(imageResult);
        message.success('이미지가 성공적으로 업로드되었습니다!');
      } else {
        throw new Error(result.error || '업로드에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
      onUploadError?.(errorMessage);
      message.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess, onUploadError]);

  // Antd Upload props
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      handleUpload(file);
      return false; // 자동 업로드 방지
    },
  };

  // 클립보드 붙여넣기 핸들러
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleUpload(file);
        }
        break;
      }
    }
  }, [handleUpload]);

  // HTML 코드 복사
  const copyHTML = useCallback((url: string) => {
    const html = generateArcaImageHTML(url);
    navigator.clipboard.writeText(html).then(() => {
      message.success('HTML 코드가 클립보드에 복사되었습니다!');
    }).catch(() => {
      message.error('복사에 실패했습니다.');
    });
  }, []);

  // URL 복사
  const copyURL = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      message.success('URL이 클립보드에 복사되었습니다!');
    }).catch(() => {
      message.error('복사에 실패했습니다.');
    });
  }, []);

  // 이미지 삭제
  const removeImage = useCallback((timestamp: number) => {
    setUploadedImages(prev => prev.filter(img => img.timestamp !== timestamp));
    message.info('이미지가 목록에서 제거되었습니다.');
  }, []);

  return (
    <div className="image-uploader" onPaste={handlePaste}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>아카라이브 스타일 이미지 업로드</Title>
            <Paragraph type="secondary">
              이미지를 업로드하면 아카라이브와 동일한 형식의 URL과 HTML 코드를 생성합니다.
              이미지를 드래그&드롭하거나, 클립보드에서 붙여넣기(Ctrl+V)도 가능합니다.
            </Paragraph>
          </div>

          <Upload.Dragger
            {...uploadProps}
            style={{ padding: '60px 20px' }}
            disabled={uploading}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              {uploading ? '업로드 중...' : '클릭하거나 파일을 여기로 드래그하세요'}
            </p>
            <p className="ant-upload-hint">
              지원 형식: JPEG, PNG, GIF, WebP (최대 10MB)
            </p>
          </Upload.Dragger>

          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            size="large"
            block
          >
            <Upload {...uploadProps}>
              파일 선택하여 업로드
            </Upload>
          </Button>
        </Space>
      </Card>

      {uploadedImages.length > 0 && (
        <Card style={{ marginTop: '20px' }}>
          <Title level={3}>업로드된 이미지</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {uploadedImages.map((imageResult) => (
              <Card
                key={imageResult.timestamp}
                size="small"
                style={{ backgroundColor: '#fafafa' }}
                extra={
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeImage(imageResult.timestamp)}
                    danger
                  />
                }
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={imageResult.originalUrl}
                      alt="Uploaded"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong>아카라이브 URL:</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <Text
                          code
                          style={{ 
                            flex: 1, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            fontSize: '12px'
                          }}
                        >
                          {imageResult.arcaUrl}
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyURL(imageResult.arcaUrl)}
                        />
                      </div>
                    </div>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  <div>
                    <Text strong>HTML 코드:</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Text
                        code
                        style={{ 
                          flex: 1, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '12px'
                        }}
                      >
                        {generateArcaImageHTML(imageResult.arcaUrl)}
                      </Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyHTML(imageResult.arcaUrl)}
                      />
                    </div>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader; 