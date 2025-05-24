export interface UploadResponse {  status: boolean;  url?: string;  error?: string;  source?: string;  message?: string;}

export enum IMAGE_UPLOAD_HOST {
  ARCA = "arca",
}

export interface ImageUploadConfig {
  enableUpload: boolean;
  uploadHost: IMAGE_UPLOAD_HOST;
  maxFileSize: number; // MB
  allowedTypes: string[];
}

export interface ImageUrlResult {
  originalUrl: string;
  arcaUrl: string;
  timestamp: number;
} 