'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import ImageUploader from './components/ImageUploader';
import { ImageUrlResult } from './types';

export default function Home() {
  const handleUploadSuccess = (result: ImageUrlResult) => {
    console.log('Upload successful:', result);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <ImageUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}
